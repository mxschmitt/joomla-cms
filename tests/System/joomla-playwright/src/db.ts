/**
 * Database helpers for Joomla Playwright tests.
 * Ported from tests/System/support/commands/db.mjs.
 */
import invalidTufMetadata from '../../fixtures/tuf/invalidMetadata.json';
import validTufMetadata from '../../fixtures/tuf/validMetadata.json';
import { queryTestDB } from './node-db';
import type { DbRecord, JoomlaExpose, JoomlaTestConfig } from './types';

type QueryFn = (sql: string) => Promise<any>;

let queryDB: QueryFn = async () => {
  throw new Error('Database helper is not configured');
};
let expose: JoomlaExpose = {} as JoomlaExpose;
const categoryCache: Record<string, number> = {};

export function configureDb(config: JoomlaTestConfig): void {
  expose = config.expose;
  queryDB = (sql) => queryTestDB(sql, config);
  Object.keys(categoryCache).forEach((key) => {
    delete categoryCache[key];
  });
}

export { queryDB };

function createInsertQuery(table: string, values: DbRecord): string {
  let query = `INSERT INTO #__${table} (\`${Object.keys(values).join('\`, \`')}\`) VALUES (:${Object.keys(values).join(',:')})`;
  Object.keys(values).forEach((variable) => {
    query = query.replace(`:${variable}`, `'${String(values[variable])}'`);
  });
  return query;
}

async function getDefaultCategoryId(extension: string): Promise<number> {
  if (categoryCache[extension] !== undefined) {
    return categoryCache[extension];
  }
  const data = await queryDB(`SELECT id FROM #__categories where extension = '${extension}' AND title = 'Uncategorised' ORDER BY id ASC LIMIT 1`);
  categoryCache[extension] = data[0].id;
  return data[0].id;
}

export async function createPrivacyConsent(privacyConsent: DbRecord = {}): Promise<number> {
  const defaults = {
    state: '0',
    created: '2023-01-01 20:00:00',
    subject: 'PLG_SYSTEM_PRIVACYCONSENT_SUBJECT',
    body: '',
  };
  const info = await queryDB(createInsertQuery('privacy_consents', { ...defaults, ...privacyConsent }));
  return info.insertId;
}

export async function createPrivacyRequest(privacyRequest: DbRecord = {}): Promise<number> {
  const defaults = {
    email: 'test@example.com',
    requested_at: '2023-01-01 20:00:00',
    status: '0',
  };
  const info = await queryDB(createInsertQuery('privacy_requests', { ...defaults, ...privacyRequest }));
  return info.insertId;
}

export async function createArticle(articleData: DbRecord = {}): Promise<DbRecord> {
  const defaults = {
    title: 'test article',
    alias: 'test-article',
    introtext: '',
    fulltext: '',
    featured: 0,
    state: 1,
    access: 1,
    language: '*',
    created: '2023-01-01 20:00:00',
    modified: '2023-01-01 20:00:00',
    publish_up: '2023-01-01 20:00:00',
    images: '',
    urls: '',
    attribs: '',
    metadesc: '',
    metadata: '',
  };
  const article: DbRecord = { ...defaults, ...articleData };
  if (article.catid === undefined) {
    article.catid = await getDefaultCategoryId('com_content');
  }
  const info = await queryDB(createInsertQuery('content', article));
  article.id = info.insertId;
  if (article.featured === 1) {
    await queryDB(`INSERT INTO #__content_frontpage (content_id, ordering) VALUES ('${article.id}', '1')`);
  }
  await queryDB(`INSERT INTO #__workflow_associations (item_id, stage_id, extension) VALUES (${article.id}, 1, 'com_content.article')`);
  return article;
}

export async function createContact(contactData: DbRecord = {}): Promise<DbRecord> {
  const defaults = {
    name: 'test contact',
    alias: 'test-contact',
    published: 1,
    access: 1,
    language: '*',
    created: '2023-01-01 20:00:00',
    modified: '2023-01-01 20:00:00',
    metadata: '',
    metadesc: '',
    params: '',
  };
  const contact: DbRecord = { ...defaults, ...contactData };
  if (contact.catid === undefined) {
    contact.catid = await getDefaultCategoryId('com_contact');
  }
  const info = await queryDB(createInsertQuery('contact_details', contact));
  contact.id = info.insertId;
  return contact;
}

export async function createBanner(bannerData: DbRecord = {}): Promise<DbRecord> {
  const defaults = {
    name: 'test banner',
    alias: 'test-banner',
    state: 1,
    type: 1,
    language: '*',
    created: '2023-01-01 20:00:00',
    modified: '2023-01-01 20:00:00',
    description: '',
    custombannercode: '',
    params: '',
  };
  const banner: DbRecord = { ...defaults, ...bannerData };
  if (banner.catid === undefined) {
    banner.catid = await getDefaultCategoryId('com_banners');
  }
  const info = await queryDB(createInsertQuery('banners', banner));
  banner.id = info.insertId;
  return banner;
}

export async function createBannerClient(bannerClientData: DbRecord = {}): Promise<DbRecord> {
  const defaults = {
    name: 'test banner client',
    contact: 'test banner client',
    state: 0,
    extrainfo: '',
  };
  const bannerclient: DbRecord = { ...defaults, ...bannerClientData };
  const info = await queryDB(createInsertQuery('banner_clients', bannerclient));
  bannerclient.id = info.insertId;
  return bannerclient;
}

export async function createNewsFeed(newsFeedData: DbRecord = {}): Promise<DbRecord> {
  const defaults = {
    name: 'test feed',
    alias: 'test-feed',
    link: '',
    published: 1,
    numarticles: 5,
    checked_out: 0,
    checked_out_time: '2023-01-01 20:00:00',
    rtl: 0,
    access: 1,
    language: '*',
    created: '2023-01-01 20:00:00',
    modified: '2023-01-01 20:00:00',
    metakey: '',
    metadata: '',
    metadesc: '',
    description: '',
    params: '',
    images: '',
  };
  const newsFeed: DbRecord = { ...defaults, ...newsFeedData };
  if (newsFeed.catid === undefined) {
    newsFeed.catid = await getDefaultCategoryId('com_newsfeeds');
  }
  const info = await queryDB(createInsertQuery('newsfeeds', newsFeed));
  newsFeed.id = info.insertId;
  return newsFeed;
}

export async function createCategory(categoryData: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test category',
    alias: 'test-category',
    path: 'test-category',
    extension: 'com_content',
    published: 1,
    access: 1,
    params: '',
    parent_id: 1,
    level: 1,
    lft: 0,
    rgt: 0,
    metadata: '',
    metadesc: '',
    created_time: '2023-01-01 20:00:00',
    modified_time: '2023-01-01 20:00:00',
  };
  const myrgt = await queryDB('SELECT rgt FROM #__categories WHERE id = 1');
  const lftVal = myrgt[0].rgt;
  const rgtVal = myrgt[0].rgt + 1;
  const finalCategory = { ...defaults, lft: lftVal, rgt: rgtVal, ...categoryData };
  await queryDB(`UPDATE #__categories SET rgt = rgt + 2 WHERE rgt >= '${lftVal}'`);
  await queryDB(`UPDATE #__categories SET lft = lft + 2 WHERE lft > '${rgtVal}'`);
  const info = await queryDB(createInsertQuery('categories', finalCategory));
  return info.insertId;
}

export async function deleteCategory(categoryTitle: { title: string }): Promise<void> {
  const record = await queryDB(`SELECT lft, rgt, (rgt - lft) +1 AS width FROM #__categories WHERE title = '${categoryTitle.title}'`);
  if (record.length > 0) {
    await queryDB(`DELETE FROM #__categories WHERE lft BETWEEN '${record[0].lft}' AND '${record[0].rgt}'`);
    await queryDB(`UPDATE #__categories SET lft = lft - '${record[0].width}' WHERE lft > '${record[0].rgt}'`);
    await queryDB(`UPDATE #__categories SET rgt = rgt - '${record[0].width}' WHERE rgt > '${record[0].rgt}'`);
  }
}

export async function createField(field: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test field',
    name: 'test-field',
    label: 'test field',
    default_value: '',
    note: '',
    description: '',
    group_id: 0,
    type: 'text',
    required: 1,
    state: 1,
    context: 'com_content.article',
    access: 1,
    language: '*',
    created_time: '2023-01-01 20:00:00',
    modified_time: '2023-01-01 20:00:00',
    params: '{"searchindex":"0"}',
    fieldparams: '',
  };
  const info = await queryDB(createInsertQuery('fields', { ...defaults, ...field }));
  return info.insertId;
}

export async function createFieldGroup(fieldGroup: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test field group',
    state: 1,
    language: '*',
    context: '',
    note: '',
    description: '',
    access: 1,
    created: '2023-01-01 20:00:00',
    modified: '2023-01-01 20:00:00',
    params: '',
  };
  const info = await queryDB(createInsertQuery('fields_groups', { ...defaults, ...fieldGroup }));
  return info.insertId;
}

export async function createFieldValue(fieldValueData: DbRecord = {}): Promise<number> {
  const defaults = { field_id: 0, item_id: 0, value: '' };
  const info = await queryDB(createInsertQuery('fields_values', { ...defaults, ...fieldValueData }));
  return info.insertId;
}

export async function createTag(tag: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test tag',
    alias: 'test-tag',
    note: '',
    description: '',
    published: 1,
    parent_id: 1,
    level: 1,
    path: 'test-tag',
    access: 1,
    lft: 1,
    metadata: '',
    metadesc: '',
    checked_out: 0,
    checked_out_time: '2023-01-01 20:00:00',
    metakey: '',
    urls: '',
    created_time: '2023-01-01 20:00:00',
    modified_time: '2023-01-01 20:00:00',
    language: '*',
    params: '',
    images: '',
  };
  const info = await queryDB(createInsertQuery('tags', { ...defaults, ...tag }));
  return info.insertId;
}

export async function createMenuType(menuTypeData: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test menu',
    menutype: 'test-menu',
    description: '',
    client_id: 0,
    asset_id: 0,
  };
  const info = await queryDB(createInsertQuery('menu_types', { ...defaults, ...menuTypeData }));
  return info.insertId;
}

export async function createMenuItem(menuItemData: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test menu item',
    alias: 'test-menu-item',
    menutype: 'mainmenu',
    type: 'component',
    link: 'index.php?option=com_content',
    component_id: 19,
    path: 'test-menu-item',
    parent_id: 1,
    level: 1,
    published: 1,
    access: 1,
    language: '*',
    params: '',
    img: '',
    lft: 0,
    rgt: 0,
  };
  const myrgt = await queryDB('SELECT rgt FROM #__menu WHERE id = 1');
  defaults.lft = myrgt[0].rgt;
  defaults.rgt = myrgt[0].rgt + 1;
  const menuItem = { ...defaults, ...menuItemData };
  const component = (new URLSearchParams(menuItem.link.replace('index.php', ''))).get('option');
  const id = await queryDB(`SELECT extension_id FROM #__extensions WHERE name = '${component}'`);
  menuItem.component_id = id[0].extension_id;
  await queryDB(`UPDATE #__menu SET rgt = rgt + 2 WHERE rgt >= '${defaults.lft}'`);
  await queryDB(`UPDATE #__menu SET lft = lft + 2 WHERE lft > '${defaults.rgt}'`);
  const info = await queryDB(createInsertQuery('menu', menuItem));
  return info.insertId;
}

export async function deleteMenuItem(menuItemTitle: { title: string }): Promise<void> {
  const record = await queryDB(`SELECT lft, rgt, (rgt - lft) +1 AS width FROM #__menu WHERE title = '${menuItemTitle.title}'`);
  if (record.length > 0) {
    await queryDB(`DELETE FROM #__menu WHERE lft BETWEEN '${record[0].lft}' AND '${record[0].rgt}'`);
    await queryDB(`UPDATE #__menu SET lft = lft - '${record[0].width}' WHERE lft > '${record[0].rgt}'`);
    await queryDB(`UPDATE #__menu SET rgt = rgt - '${record[0].width}' WHERE rgt > '${record[0].rgt}'`);
  }
}

export async function createModule(module: DbRecord = {}): Promise<number> {
  const defaults = {
    title: 'test module',
    position: 'sidebar-right',
    module: '',
    client_id: 0,
    access: 1,
    published: 1,
    language: '*',
    params: '',
  };
  const info = await queryDB(createInsertQuery('modules', { ...defaults, ...module }));
  await queryDB(`INSERT INTO #__modules_menu (moduleid, menuid) VALUES ('${info.insertId}', '0')`);
  return info.insertId;
}

export async function createUser(userData: DbRecord = {}): Promise<number> {
  const defaults = {
    name: 'test user',
    username: 'test',
    email: 'test@example.com',
    password: '098f6bcd4621d373cade4e832627b4f6',
    block: 0,
    registerDate: '2023-03-01 20:00:00',
    params: '',
  };
  const user: DbRecord = { ...defaults, ...userData };
  const groupId = user.group_id ?? 2;
  delete user.group_id;
  const info = await queryDB(createInsertQuery('users', user));
  await queryDB(`INSERT INTO #__user_usergroup_map (user_id, group_id) VALUES ('${info.insertId}', '${groupId}')`);
  return info.insertId;
}

export async function createUserGroup(groupData: DbRecord = {}): Promise<DbRecord> {
  const defaults = { title: 'test group', parent_id: 1, lft: 1, rgt: 1 };
  const group: DbRecord = { ...defaults, ...groupData };
  const info = await queryDB(createInsertQuery('usergroups', group));
  group.id = info.insertId;
  return group;
}

export async function createUserLevel(levelData: DbRecord = {}): Promise<DbRecord> {
  const defaults = { title: 'test level', rules: '[1]' };
  const level: DbRecord = { ...defaults, ...levelData };
  const info = await queryDB(createInsertQuery('viewlevels', level));
  level.id = info.insertId;
  return level;
}

export async function createSchedulerTask(taskData: DbRecord = {}): Promise<DbRecord> {
  const defaults = {
    title: 'test task',
    type: '',
    execution_rules: {},
    cron_rules: {},
    state: 1,
    params: {},
    note: '',
    created: '2023-01-01 20:00:00',
  };
  const task: DbRecord = { ...defaults, ...taskData };
  ['execution_rules', 'cron_rules', 'params'].forEach((key) => {
    if (typeof task[key] === 'object') {
      task[key] = JSON.stringify(task[key]);
    }
  });
  const info = await queryDB(createInsertQuery('scheduler_tasks', task));
  task.id = info.insertId;
  return task;
}

export async function updateExtensionParameter(key: string, value: unknown, extension: string): Promise<any> {
  const paramsString = await queryDB(`SELECT params FROM #__extensions WHERE name = '${extension}'`);
  const params = JSON.parse(paramsString[0].params);
  params[key] = value;
  return queryDB(`UPDATE #__extensions SET params = '${JSON.stringify(params)}' WHERE name = '${extension}'`);
}

export async function enableExtension(value: number | string, extension: string): Promise<any> {
  return queryDB(`UPDATE #__extensions SET enabled ='${value}' WHERE name = '${extension}'`);
}

export async function getUserId(): Promise<number> {
  const id = await queryDB(`SELECT id FROM #__users WHERE username = '${expose.username}'`);
  if (id.length === 0) {
    return 0;
  }
  return id[0].id;
}

export async function setInvalidTufRoot(): Promise<void> {
  await queryDB('DELETE FROM #__updates WHERE update_site_id = 1');
  await queryDB(`UPDATE #__tuf_metadata SET root = '${JSON.stringify(invalidTufMetadata.root)}', targets = '', snapshot = '', timestamp = '' WHERE id = 1`);
}

export async function setValidTufRoot(): Promise<void> {
  await queryDB('DELETE FROM #__updates WHERE update_site_id = 1');
  await queryDB(`UPDATE #__tuf_metadata SET root = '${JSON.stringify(validTufMetadata.root)}', targets = '', snapshot = '', timestamp = '' WHERE id = 1`);
}
