// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the privacy consent component', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__privacy_consents');
    await joomla.queryDB("DELETE FROM #__users WHERE name = 'test user'");
    await page.locator('.js-stools-btn-clear').click({ force: true }).catch(() => {});
  });
  test('can view privacy consents', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'test body',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
  });
  test('can invalidate privacy consent', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'test body',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await page.locator('#cb0').click();
    await page.locator('.button-trash').click();
    await joomla.clickDialogConfirm(true);
    await expect(page.locator('.alert-message')).toContainText('The consent was invalidated.');
  });
  test('can invalidate all privacy consents', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'test body',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await page.locator('.w-1.text-center > .form-check-input').click();
    await page.locator('#toolbar-trash').click();
    await joomla.clickDialogConfirm(true);
    await expect(page.locator('.alert-message')).toContainText('2 consents were invalidated');
  });
  test('can filter by valid consent', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'invalidated consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'obsolete consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await joomla.setFilter('state', 'Valid Consent');
    await expect(page.locator('tbody > tr > :nth-child(7)').filter({ hasText: 'valid consent user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
  });
  test('can filter by invalidated consent', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'invalidated consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'obsolete consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await joomla.setFilter('state', 'Invalidated Consent');
    await expect(page.locator('tbody > tr > :nth-child(7)').filter({ hasText: 'invalidated consent user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
  });
  test('can filter by obsolete consent', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'invalidated consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'obsolete consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await joomla.setFilter('state', 'Obsolete Consent');
    await expect(page.locator('tbody > tr > :nth-child(7)').filter({ hasText: 'obsolete consent user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
  });
  test('can search username', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await joomla.searchForItem('test');
    await expect(page.locator('tbody > tr > :nth-child(7)').filter({ hasText: 'valid consent user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
    await joomla.searchForItem();
    await joomla.searchForItem('random user');
    await expect(page.locator('.alert')).toContainText('No Matching Results');
  });
  test('can search user id', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await page.locator('#filter_search').fill(`UID:${id}`);
    await Promise.all([
      page.waitForLoadState('networkidle').catch(() => {}),
      page.locator('.filter-search-bar__button').click(),
    ]);
    await expect(page.locator('tbody > tr > :nth-child(7)').filter({ hasText: 'valid consent user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
    await page.locator('.js-stools-btn-clear').click();
    await page.locator('#filter_search').fill('UID:0');
    await page.locator('.filter-search-bar__button').click();
    await expect(page.locator('.alert')).toContainText('No Matching Results');
  });
  test('can search consent id', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const userId = await joomla.db_createUser();
    const id = await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${userId}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await page.locator('#filter_search').fill(`ID:${id}`);
    await Promise.all([
      page.waitForLoadState('networkidle').catch(() => {}),
      page.locator('.filter-search-bar__button').click(),
    ]);
    await expect(page.locator('tbody > tr > :nth-child(7)').filter({ hasText: 'valid consent user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
    await page.locator('.js-stools-btn-clear').click();
    await page.locator('#filter_search').fill('UID:0');
    await page.locator('.filter-search-bar__button').click();
    await expect(page.locator('.alert')).toContainText('No Matching Results');
  });
  test('can display correct number of consents', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    for (let i = 0; i < 550; i += 1) {
      await joomla.db_createPrivacyConsent({
        state: 1,
        user_id: `${id}`
      });
    }
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await page.locator('#list_limit').selectOption('5', { force: true });
    await expect(page.locator('table').locator('tr')).toHaveCount(6);
    await page.locator('#list_limit').selectOption('10');
    await expect(page.locator('table').locator('tr')).toHaveCount(11);
    await page.locator('#list_limit').selectOption('15');
    await expect(page.locator('table').locator('tr')).toHaveCount(16);
    await page.locator('#list_limit').selectOption('20');
    await expect(page.locator('table').locator('tr')).toHaveCount(21);
    await page.locator('#list_limit').selectOption('25');
    await expect(page.locator('table').locator('tr')).toHaveCount(26);
    await page.locator('#list_limit').selectOption('30');
    await expect(page.locator('table').locator('tr')).toHaveCount(31);
    await page.locator('#list_limit').selectOption('50');
    await expect(page.locator('table').locator('tr')).toHaveCount(51);
    await page.locator('#list_limit').selectOption('100');
    await expect(page.locator('table').locator('tr')).toHaveCount(101);
    await page.locator('#list_limit').selectOption('200');
    await expect(page.locator('table').locator('tr')).toHaveCount(201);
    await page.locator('#list_limit').selectOption('500');
    await expect(page.locator('table').locator('tr')).toHaveCount(501);
    await page.locator('#list_limit').selectOption('All');
    await expect(page.locator('table').locator('tr')).toHaveCount(551);
  });
  test('can list by status in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'invalidated consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'obsolete consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Status ascending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > :nth-child(7)')).toContainText('invalidated consent user');
    await expect(page.locator('tbody > :nth-child(2) > :nth-child(7)')).toContainText('obsolete consent user');
    await expect(page.locator('tbody > :nth-child(3) > :nth-child(7)')).toContainText('valid consent user');
  });
  test('can list by status in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'invalidated consent user',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'obsolete consent user',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Status descending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > :nth-child(7)')).toContainText('valid consent user');
    await expect(page.locator('tbody > :nth-child(2) > :nth-child(7)')).toContainText('obsolete consent user');
    await expect(page.locator('tbody > :nth-child(3) > :nth-child(7)')).toContainText('invalidated consent user');
  });
  test('can list by name in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    let id = await joomla.db_createUser({
      name: 'a test user',
      username: 'a test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'b test user',
      username: 'b test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'c test user',
      username: 'c test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Username ascending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > :nth-child(4)')).toContainText('a test user');
    await expect(page.locator('tbody > :nth-child(2) > :nth-child(4)')).toContainText('b test user');
    await expect(page.locator('tbody > :nth-child(3) > :nth-child(4)')).toContainText('c test user');
  });
  test('can list by name in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    let id = await joomla.db_createUser({
      name: 'a test user',
      username: 'a test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'b test user',
      username: 'b test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'c test user',
      username: 'c test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Username descending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > :nth-child(4)')).toContainText('c test user');
    await expect(page.locator('tbody > :nth-child(2) > :nth-child(4)')).toContainText('b test user');
    await expect(page.locator('tbody > :nth-child(3) > :nth-child(4)')).toContainText('a test user');
  });
  test('can list by username in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    let id = await joomla.db_createUser({
      name: 'a test user',
      username: 'a test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'b test user',
      username: 'b test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'c test user',
      username: 'c test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Name descending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > th')).toContainText('c test user');
    await expect(page.locator('tbody > :nth-child(2) > th')).toContainText('b test user');
    await expect(page.locator('tbody > :nth-child(3) > th')).toContainText('a test user');
  });
  test('can list by username in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    let id = await joomla.db_createUser({
      name: 'a test user',
      username: 'a test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'b test user',
      username: 'b test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'c test user',
      username: 'c test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Name ascending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > th')).toContainText('a test user');
    await expect(page.locator('tbody > :nth-child(2) > th')).toContainText('b test user');
    await expect(page.locator('tbody > :nth-child(3) > th')).toContainText('c test user');
  });
  test('can list by user_id in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    let id = await joomla.db_createUser({
      name: 'a test user',
      username: 'a test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'b test user',
      username: 'b test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'c test user',
      username: 'c test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('User ID ascending');
    await __wait;
    const cellData = [];
    for (let i = 1; i < 4; i += 1) {
      const text = await page.locator(`tbody > :nth-child(${i}) > :nth-child(5)`).textContent();
      const cleanText = parseInt(text.trim(), 10);
      cellData.push(cleanText);
    }
    const data = cellData;
    const sortedArray = data.slice().sort((a, b) => a - b);
    await expect(sortedArray[0]).toBe(data[0]);
    await expect(sortedArray[1]).toBe(data[1]);
    await expect(sortedArray[2]).toBe(data[2]);
  });
  test('can list by user_id in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    let id = await joomla.db_createUser({
      name: 'a test user',
      username: 'a test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'b test user',
      username: 'b test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    id = await joomla.db_createUser({
      name: 'c test user',
      username: 'c test user'
    });
    await joomla.db_createPrivacyConsent({
      state: 1,
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('User ID descending');
    await __wait;
    const cellData = [];
    for (let i = 1; i < 4; i += 1) {
      const text = await page.locator(`tbody > :nth-child(${i}) > :nth-child(5)`).textContent();
      const cleanText = parseInt(text.trim(), 10);
      cellData.push(cleanText);
    }
    const data = cellData;
    const sortedArray = data.slice().sort((a, b) => b - a);
    await expect(sortedArray[0]).toBe(data[0]);
    await expect(sortedArray[1]).toBe(data[1]);
    await expect(sortedArray[2]).toBe(data[2]);
  });
  test('can list by subject in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      subject: 'a test subject',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      subject: 'b test subject',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      subject: 'c test subject',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Subject ascending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > :nth-child(6)')).toContainText('a test subject');
    await expect(page.locator('tbody > :nth-child(2) > :nth-child(6)')).toContainText('b test subject');
    await expect(page.locator('tbody > :nth-child(3) > :nth-child(6)')).toContainText('c test subject');
  });
  test('can list by subject in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      subject: 'a test subject',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      subject: 'b test subject',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      subject: 'c test subject',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Subject descending');
    await __wait;
    await expect(page.locator('tbody > :nth-child(1) > :nth-child(6)')).toContainText('c test subject');
    await expect(page.locator('tbody > :nth-child(2) > :nth-child(6)')).toContainText('b test subject');
    await expect(page.locator('tbody > :nth-child(3) > :nth-child(6)')).toContainText('a test subject');
  });
  test('can list by consented in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      created: '2023-01-01 20:00:00',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      created: '2022-12-31 18:30:00',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      created: '2024-02-15 12:45:00 ',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Consented descending');
    await __wait;
    const cellData = [];
    for (let i = 1; i < 4; i += 1) {
      const text = await page.locator(`:nth-child(${i}) > .break-word > .small`).textContent();
      const parts = text.split('\n');
      const extractedString = parts[1].trim();
      cellData.push(extractedString);
    }
    const data = cellData;
    const sortedArray = data.slice().sort((a, b) => new Date(b) - new Date(a));
    await expect(sortedArray[0]).toBe(data[0]);
    await expect(sortedArray[1]).toBe(data[1]);
    await expect(sortedArray[2]).toBe(data[2]);
  });
  test('can list by consented in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      created: '2023-01-01 20:00:00',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      created: '2022-12-31 18:30:00',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      created: '2024-02-15 12:45:00 ',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('Consented ascending');
    await __wait;
    const cellData = [];
    for (let i = 1; i < 4; i += 1) {
      const text = await page.locator(`:nth-child(${i}) > .break-word > .small`).textContent();
      const parts = text.split('\n');
      const extractedString = parts[1].trim();
      cellData.push(extractedString);
    }
    const data = cellData;
    const sortedArray = data.slice().sort((a, b) => new Date(a) - new Date(b));
    await expect(sortedArray[0]).toBe(data[0]);
    await expect(sortedArray[1]).toBe(data[1]);
    await expect(sortedArray[2]).toBe(data[2]);
  });
  test('can list by id in descending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'test body',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('ID descending');
    await __wait;
    const cellData = [];
    for (let i = 1; i < 4; i += 1) {
      const text = await page.locator(`tbody > :nth-child(${i}) > :nth-child(9)`).textContent();
      const cleanText = parseInt(text.trim(), 10);
      cellData.push(cleanText);
    }
    const data = cellData;
    const sortedArray = data.slice().sort((a, b) => b - a);
    await expect(sortedArray[0]).toBe(data[0]);
    await expect(sortedArray[1]).toBe(data[1]);
    await expect(sortedArray[2]).toBe(data[2]);
  });
  test('can list by id in ascending order', async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    const id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: -1,
      body: 'test body',
      user_id: `${id}`
    });
    await joomla.db_createPrivacyConsent({
      state: 0,
      body: 'test body',
      user_id: `${id}`
    });
    await page.goto('/administrator/index.php?option=com_privacy&view=consents&filter=');
    await expect(page.locator('tbody > tr > :nth-child(4)').filter({ hasText: 'test user' }).first()).toBeVisible();
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    const __wait = page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*\/administrator\/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
    await page.locator('#list_fullordering').selectOption('ID ascending');
    await __wait;
    const cellData = [];
    for (let i = 1; i < 4; i += 1) {
      const text = await page.locator(`tbody > :nth-child(${i}) > :nth-child(9)`).textContent();
      const cleanText = parseInt(text.trim(), 10);
      cellData.push(cleanText);
    }
    const data = cellData;
    const sortedArray = data.slice().sort((a, b) => a - b);
    await expect(sortedArray[0]).toBe(data[0]);
    await expect(sortedArray[1]).toBe(data[1]);
    await expect(sortedArray[2]).toBe(data[2]);
  });
});
