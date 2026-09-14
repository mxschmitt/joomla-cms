import mysql from 'mysql2';
import pg from 'pg';
import type { JoomlaTestConfig } from './types';

const { Pool } = pg as { Pool: new (config: Record<string, unknown>) => {
  query: (sql: string) => Promise<{ rows: Array<Record<string, any>> }>;
} };

interface InsertCache {
  table: string;
  rows: number[];
}

let insertedItems: InsertCache[] = [];
let postgresConnectionPool: InstanceType<typeof Pool> | null = null;

export function queryTestDB(joomlaQuery: string, config: JoomlaTestConfig): Promise<any> {
  let query = joomlaQuery.replaceAll('#__', config.expose.db_prefix);
  const tableNameOfInsert = query.match(/insert\s+into\s+(.*?)\s/i);
  let insertItem = tableNameOfInsert && tableNameOfInsert.length > 1
    ? insertedItems.find((item) => item.table === tableNameOfInsert[1])
    : undefined;

  if (tableNameOfInsert && tableNameOfInsert.length > 1 && !insertItem) {
    insertItem = { table: tableNameOfInsert[1], rows: [] };
    insertedItems.push(insertItem);
  }

  if (config.expose.db_type === 'pgsql' || config.expose.db_type === 'PostgreSQL (PDO)') {
    if (postgresConnectionPool === null) {
      let hostOrUnixPath = config.expose.db_host;
      if (hostOrUnixPath.startsWith('unix:/')) {
        hostOrUnixPath = hostOrUnixPath.replace('unix:', '');
      }
      postgresConnectionPool = new Pool({
        host: hostOrUnixPath,
        port: Number(config.expose.db_port) || undefined,
        database: config.expose.db_name,
        user: config.expose.db_user,
        password: config.expose.db_password,
        max: 10,
      });
    }

    if (insertItem) {
      query += ' returning *';
    }
    query = query.replaceAll('`', '"');

    return postgresConnectionPool.query(query).then((result: { rows: Array<Record<string, any>> }) => {
      if (query.startsWith('SELECT') && !Array.isArray(result.rows)) {
        return [result.rows];
      }
      if (!insertItem || result.rows.length === 0) {
        return result.rows;
      }
      if (insertItem && result.rows.length && result.rows[0].id) {
        insertItem.rows.push(result.rows[0].id);
      }
      return { insertId: result.rows[0].id };
    }).catch((error: Error) => {
      throw new Error(`Postgres query failed: ${error.message}`);
    });
  }

  return new Promise((resolve, reject) => {
    const connectionConfig = config.expose.db_host.startsWith('unix:/')
      ? {
          socketPath: config.expose.db_host.replace('unix:', ''),
          user: config.expose.db_user,
          password: config.expose.db_password,
          database: config.expose.db_name,
        }
      : {
          host: config.expose.db_host,
          port: Number(config.expose.db_port) || undefined,
          user: config.expose.db_user,
          password: config.expose.db_password,
          database: config.expose.db_name,
        };

    const connection = mysql.createConnection(connectionConfig);
    connection.query(query, (error, results) => {
      connection.end();
      if (error && 'errno' in error && error.errno) {
        return reject(error);
      }
      const insertResults = results as { insertId?: number };
      if (insertItem && insertResults && insertResults.insertId) {
        insertItem.rows.push(insertResults.insertId);
      }
      return resolve(results);
    });
  });
}

export function deleteInsertedItems(config: JoomlaTestConfig): Promise<unknown> {
  const promises: Promise<unknown>[] = [];
  insertedItems.forEach((item) => {
    if (item.rows.length < 1) {
      return;
    }
    promises.push(queryTestDB(`DELETE FROM ${item.table} WHERE id IN (${item.rows.join(',')})`, config).then(() => {
      if (item.table === `${config.expose.db_prefix}users`) {
        promises.push(queryTestDB(`DELETE FROM #__user_usergroup_map WHERE user_id IN (${item.rows.join(',')})`, config));
        promises.push(queryTestDB(`DELETE FROM #__user_profiles WHERE user_id IN (${item.rows.join(',')})`, config));
        promises.push(queryTestDB(`DELETE FROM #__session WHERE userid IN (${item.rows.join(',')})`, config));
      }
      if (item.table === `${config.expose.db_prefix}content`) {
        promises.push(queryTestDB(`DELETE FROM #__content_frontpage WHERE content_id IN (${item.rows.join(',')})`, config));
        promises.push(queryTestDB(`DELETE FROM #__workflow_associations WHERE item_id IN (${item.rows.join(',')}) AND extension = 'com_content.article'`, config));
      }
      if (item.table === `${config.expose.db_prefix}modules`) {
        promises.push(queryTestDB(`DELETE FROM #__modules_menu WHERE moduleid IN (${item.rows.join(',')})`, config));
      }
    }));
  });
  insertedItems = [];
  return Promise.all(promises);
}
