import { expect, type CDPSession, type Page } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeRelativeFile } from './node-fs';
import type { CliResult, JoomlaExpose, JoomlaTestConfig } from './types';

const execFileAsync = promisify(execFile);

export async function clickToolbarButton(page: Page, button: string, subselector: string | null = null): Promise<void> {
  switch (button.toLowerCase()) {
    case 'new':
      await page.locator('#toolbar-new').click();
      break;
    case 'enable':
      await page.locator('#toolbar-publish button').click();
      break;
    case 'publish':
      await page.locator('#status-group-children-publish').click();
      break;
    case 'unpublish':
      await page.locator('#status-group-children-unpublish').click();
      break;
    case 'archive':
      await page.locator('#status-group-children-archive').click();
      break;
    case 'check-in':
      await page.locator('#status-group-children-checkin').click();
      break;
    case 'batch':
      await page.locator('#status-group-children-batch').click();
      break;
    case 'rebuild':
      await page.locator('#toolbar-refresh button').click();
      break;
    case 'trash':
      await page.locator('#status-group-children-trash').click();
      break;
    case 'save':
      await page.locator('#toolbar-apply').click();
      break;
    case 'save & close':
      await page.locator('.button-save').filter({ hasText: 'Save & Close' }).first().click();
      break;
    case 'save & new':
      await page.locator('#save-group-children-save-new').click();
      break;
    case 'cancel':
      await page.locator('#toolbar-cancel').click();
      break;
    case 'options':
      await page.locator('#toolbar-options').click();
      break;
    case 'empty trash':
    case 'delete':
      await page.locator('#toolbar-delete').click();
      break;
    case 'feature':
      await page.locator('#status-group-children-featured').click();
      break;
    case 'unfeature':
      await page.locator('#status-group-children-unfeatured').click();
      break;
    case 'action':
      await page.locator('#toolbar-status-group').click();
      break;
    case 'transition':
      await page.locator(`.button-transition.transition-${subselector}`).click();
      break;
    case 'versions':
      await page.locator('#toolbar-versions').click();
      break;
    default:
      throw new Error(`Unknown toolbar button: ${button}`);
  }
}

export async function checkForSystemMessage(page: Page, contain: string): Promise<void> {
  await expect(page.locator('#system-message-container .alert-message').filter({ hasText: contain })).toBeVisible();
}

export async function checkForPhpNoticesOrWarnings(page: Page): Promise<void> {
  let html: string;
  try {
    html = await page.content();
  } catch {
    // The page may still be navigating when a test ends; skip the scan then.
    return;
  }
  const regex = /<b>(Warning|Deprecated|Notice|Strict standards)<\/b>:(.*?)(<br|$)/;
  const match = regex.exec(html);
  if (match) {
    throw new Error(`Unwanted PHP ${match[1]}: ${JSON.stringify(match[2])}`);
  }
}

export async function searchForItem(page: Page, name: string | null = null): Promise<void> {
  if (name) {
    await page.locator('#filter_search').fill(name);
    await Promise.all([
      page.waitForLoadState('networkidle').catch(() => {}),
      page.locator('.filter-search-bar__button').click(),
    ]);
    return;
  }
  await page.locator('.js-stools-btn-clear').click();
}

export async function setFilter(page: Page, name: string, value: string): Promise<void> {
  const container = page.locator('#adminForm .js-stools-container-filters');
  if (!(await container.isVisible().catch(() => false))) {
    await page.locator('button.js-stools-btn-filter').click();
  }
  await page.locator(`#filter_${name}`).selectOption({ label: value }).catch(async () => {
    await page.locator(`#filter_${name}`).selectOption(value);
  });
  await page.waitForLoadState('networkidle').catch(() => {});
}

export async function checkAllResults(page: Page): Promise<void> {
  await page.locator('thead input[name=\'checkall-toggle\']').click();
}

export async function clickDialogConfirm(page: Page, isOkay: boolean): Promise<void> {
  const selector = isOkay
    ? '.joomla-dialog-confirm button[data-button-ok]'
    : '.joomla-dialog-confirm button[data-button-cancel]';
  await page.locator(selector).click({ timeout: 5000 });
}

export async function selectOptionInFancySelect(page: Page, selectId: string, option: string): Promise<void> {
  const fancy = page.locator(selectId).locator('xpath=ancestor::joomla-field-fancy-select');
  await fancy.locator('.choices__inner').click();
  await fancy.locator('.choices__item').filter({ hasText: option }).click();
}

export async function toggleSwitch(page: Page, fieldName: string, valueName: string): Promise<void> {
  const group = page.locator('.control-group').filter({ has: page.locator('label:visible', { hasText: fieldName }) });
  const label = group.locator('.switcher label').filter({ hasText: valueName });
  const id = await label.getAttribute('for');
  if (!id) {
    throw new Error(`Could not find switch input for ${fieldName}/${valueName}`);
  }
  await page.evaluate((inputId) => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.checked = true;
    }
  }, id);
}

const cookieCache = new Map<string, any[]>();

async function restoreCookies(page: Page, key: string): Promise<void> {
  const cached = cookieCache.get(key);
  if (!cached?.length) {
    return;
  }
  await page.context().addCookies(cached);
}

async function storeCookies(page: Page, key: string): Promise<void> {
  cookieCache.set(key, await page.context().cookies());
}

export function clearCachedSessions(): void {
  cookieCache.clear();
}

export async function doAdministratorLogin(page: Page, expose: JoomlaExpose, user?: string | null, password?: string | null, useSnapshot = true): Promise<void> {
  const username = user || expose.username;
  const pass = password || expose.password;
  const key = `admin:${username}:${pass}`;
  if (useSnapshot !== false) {
    await restoreCookies(page, key);
  }
  await page.goto('administrator/index.php');
  if (await page.locator('#mod-login-username').isVisible().catch(() => false)) {
    await page.locator('#mod-login-username').fill(username);
    await page.locator('#mod-login-password').fill(pass);
    await page.locator('#btn-login-submit').click();
  }
  await expect(page.locator('h1.page-title')).toContainText('Home Dashboard');
  if (useSnapshot !== false) {
    await storeCookies(page, key);
  }
}

export async function openAdministratorAccount(page: Page): Promise<void> {
  await page.locator('.header-item .header-profile > .dropdown-toggle').click();
  await page.locator('.header-item .header-profile a.dropdown-item').filter({ hasText: 'Edit Account' }).first().click();
}

export async function doAdministratorLogout(page: Page): Promise<void> {
  await page.locator('.header-item .header-profile > .dropdown-toggle').click();
  await page.locator('.header-item .header-profile a.dropdown-item').last().click();
  await expect(page.locator('#mod-login-username')).toBeVisible();
  clearCachedSessions();
}

export async function doFrontendLogin(page: Page, expose: JoomlaExpose, user?: string | null, password?: string | null, useSnapshot = true): Promise<void> {
  const username = user || expose.username;
  const pass = password || expose.password;
  const key = `front:${username}:${pass}`;
  if (useSnapshot !== false) {
    await restoreCookies(page, key);
  }
  await page.goto('index.php?option=com_users&view=login');
  if (await page.locator('#username').isVisible().catch(() => false)) {
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(pass);
    await page.locator('.com-users-login__form button[type=submit]').click();
  }
  await expect(page.locator('.mod-login-logout button[type=submit]')).toContainText('Log out');
  if (useSnapshot !== false) {
    await storeCookies(page, key);
  }
}

export async function doFrontendLogout(page: Page): Promise<void> {
  await page.goto('index.php?option=com_users&view=login');
  await page.locator('.com-users-logout__form button[type=submit]').filter({ hasText: 'Log out' }).click();
  clearCachedSessions();
}

export async function cancelTour(page: Page): Promise<void> {
  const startButton = page.locator('.shepherd-button-primary');
  await expect(startButton).toBeVisible({ timeout: 15000 });
  const skip = page.locator('.shepherd-button-secondary');
  if (await skip.count()) {
    await skip.click();
  } else {
    await page.locator('.shepherd-cancel-icon').click();
  }
}

export async function disableStatistics(page: Page): Promise<void> {
  const statisticPlugin = 'System - Joomla! Statistics';
  await page.goto('/administrator/index.php?option=com_plugins&view=plugins');
  await searchForItem(page, statisticPlugin);
  await page.getByRole('link', { name: statisticPlugin }).click();
  await page.locator('select#jform_enabled').selectOption('Disabled');
  await page.locator('button.button-save.btn.btn-success').click();
}

export async function setErrorReportingToDevelopment(page: Page): Promise<void> {
  await page.goto('administrator/index.php?option=com_config');
  await expect(page.locator('.page-title')).toContainText('Global Configuration');
  await page.locator("div[role='tablist'] button[aria-controls='page-server']").click();
  await page.locator('#jform_error_reporting').selectOption('Maximum');
  await clickToolbarButton(page, 'save');
  await expect(page.locator('.page-title')).toContainText('Global Configuration');
  await expect(page.locator('#system-message-container')).toContainText('Configuration saved.');
}

export async function prepareInstaller(page: Page): Promise<void> {
  await page.goto('installation/index.php');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#jform_site_name')).toBeVisible();

  // Joomla < 6 shows a language <select> on the page. Joomla 7 keeps it in a
  // dialog behind a Change button; English is already selected, so leave it.
  const language = page.locator('#jform_language');
  if (await language.isVisible().catch(() => false)) {
    await language.selectOption('en-GB').catch(async () => {
      const english = language.locator('option').filter({ hasText: 'English' }).first();
      const value = await english.getAttribute('value');
      if (value) {
        await language.selectOption(value);
      }
    });
  }
}

export async function doInstallation(page: Page, config: JoomlaExpose): Promise<void> {
  await prepareInstaller(page);
  await page.locator('#jform_site_name').fill(config.sitename);
  await page.locator('#step1').click();
  await page.locator('#jform_admin_user').fill(config.name);
  await page.locator('#jform_admin_username').fill(config.username);
  await page.locator('#jform_admin_password').fill(config.password);
  await page.locator('#jform_admin_email').fill(config.email);
  await page.locator('#step2').click();

  let connection = config.db_host;
  const isPortSet = config.db_port && String(config.db_port).trim() !== '';
  if (connection.split(':').length > 2 && !connection.includes('[')
    && (isPortSet || (config.db_type !== 'PostgreSQL (PDO)' && config.db_type !== 'pgsql'))) {
    connection = `[${connection}]`;
  }
  if (isPortSet) {
    connection += `:${String(config.db_port).trim()}`;
  }

  await page.locator('#jform_db_type').selectOption(config.db_type);
  await page.locator('#jform_db_host').fill(connection);
  await page.locator('#jform_db_user').fill(config.db_user);
  if (config.db_password) {
    await page.locator('#jform_db_pass').fill(config.db_password);
  }
  await page.locator('#jform_db_name').fill(config.db_name);
  await page.locator('#jform_db_prefix').fill(config.db_prefix);

  const finished = page.waitForURL(/view=remove/, { timeout: 120000 });
  await page.locator('#setupButton').click();
  await finished;
  await expect(page.locator('#installCongrat')).toBeVisible({ timeout: 120000 });
}

export async function installJoomla(page: Page, config: JoomlaExpose): Promise<void> {
  await doInstallation(page, config);
  const complete = page.locator('button.complete-installation');
  if (await complete.count()) {
    await complete.first().click();
  }
}

export async function configSetParameter(config: JoomlaTestConfig, parameter: string, value: string | number | boolean): Promise<string> {
  const configPath = join(config.expose.cmsPath, 'configuration.php');
  const fileContent = readFileSync(configPath, 'utf8');
  const newValue = typeof value === 'string' ? `'${value}'` : value;
  const regex = new RegExp(`^.*\\$${parameter}\\s.*$`, 'mg');
  const content = fileContent.replace(regex, `public $${parameter} = ${newValue};`);
  return writeRelativeFile('configuration.php', content, config);
}

export async function execPhp(command: string, options: { failOnNonZeroExit?: boolean } = {}): Promise<CliResult> {
  const failOnNonZeroExit = options.failOnNonZeroExit !== false;
  try {
    const { stdout, stderr } = await execFileAsync('bash', ['-lc', command], { maxBuffer: 10 * 1024 * 1024 });
    return { stdout, stderr, code: 0, exitCode: 0 };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; code?: number };
    const result = {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      code: err.code || 1,
      exitCode: err.code || 1,
    };
    if (failOnNonZeroExit) {
      throw error;
    }
    return result;
  }
}

export async function enableWebAuthn(page: Page): Promise<CDPSession> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  });
  return cdp;
}

export async function disableWebAuthn(cdp?: CDPSession | null): Promise<void> {
  if (!cdp) {
    return;
  }
  await cdp.send('WebAuthn.disable').catch(() => {});
}
