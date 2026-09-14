import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { JoomlaExpose, JoomlaTestConfig } from './types';

const cmsRoot = process.cwd();

/**
 * Default expose values, matching cypress.config.dist.mjs.
 * Override with JOOMLA_TEST_* environment variables.
 */
export function loadJoomlaTestConfig(overrides: Partial<JoomlaExpose> = {}): JoomlaTestConfig {
  const expose: JoomlaExpose = {
    sitename: process.env.JOOMLA_TEST_SITENAME || 'Joomla CMS Test',
    name: process.env.JOOMLA_TEST_NAME || 'jane doe',
    email: process.env.JOOMLA_TEST_EMAIL || 'admin@example.com',
    username: process.env.JOOMLA_TEST_USERNAME || 'ci-admin',
    password: process.env.JOOMLA_TEST_PASSWORD || 'joomla-17082005',
    db_type: process.env.JOOMLA_TEST_DB_TYPE || 'MySQLi',
    db_host: process.env.JOOMLA_TEST_DB_HOST || 'localhost',
    db_port: process.env.JOOMLA_TEST_DB_PORT || '',
    db_name: process.env.JOOMLA_TEST_DB_NAME || 'test_joomla',
    db_user: process.env.JOOMLA_TEST_DB_USER || 'root',
    db_password: process.env.JOOMLA_TEST_DB_PASSWORD ?? '',
    db_prefix: process.env.JOOMLA_TEST_DB_PREFIX || 'jos_',
    smtp_host: process.env.JOOMLA_TEST_SMTP_HOST || 'localhost',
    smtp_port: process.env.JOOMLA_TEST_SMTP_PORT || '1025',
    cmsPath: process.env.JOOMLA_TEST_CMS_PATH || cmsRoot,
    logFile: process.env.JOOMLA_TEST_LOG_FILE || '/var/log/apache2/error.log',
    ...overrides,
  };

  return {
    baseURL: process.env.JOOMLA_TEST_BASE_URL || 'http://localhost/',
    cmsRoot,
    expose,
  };
}

export function readCmsConfigParameter(cmsPath: string, parameter: string): string | undefined {
  const content = readFileSync(join(cmsPath, 'configuration.php'), 'utf8');
  const match = content.match(new RegExp(`\\$${parameter}\\s*=\\s*(.+);`, 'm'));
  return match ? match[1].replace(/^['"]|['"]$/g, '') : undefined;
}
