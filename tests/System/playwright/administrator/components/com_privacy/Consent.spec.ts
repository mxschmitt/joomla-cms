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
    await page.locator('.js-stools-btn-clear').click({
      force: true
    });
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await page.locator('.js-stools-btn-filter').click();
    await page.locator('#filter_state').selectOption({
      label: 'Valid Consent'
    });
    await expect(page.locator('tbody > tr > :nth-child(7)')).toContainText('valid consent user');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await page.locator('.js-stools-btn-filter').click();
    await page.locator('#filter_state').selectOption({
      label: 'Invalidated Consent'
    });
    await expect(page.locator('tbody > tr > :nth-child(7)')).toContainText('invalidated consent user');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await page.locator('.js-stools-btn-filter').click();
    await page.locator('#filter_state').selectOption({
      label: 'Obsolete Consent'
    });
    await expect(page.locator('tbody > tr > :nth-child(7)')).toContainText('obsolete consent user');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await page.locator('#filter_search').fill('test');
    await page.locator('.filter-search-bar__button').click();
    await expect(page.locator('tbody > tr > :nth-child(7)')).toContainText('valid consent user');
    await expect(page.locator('table').locator('tr')).toHaveCount(2);
    await page.locator('.js-stools-btn-clear').click();
    await page.locator('#filter_search').fill('random user');
    await page.locator('.filter-search-bar__button').click();
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await page.locator('#filter_search').fill(`UID:${id}`);
    await page.locator('.filter-search-bar__button').click();
    await expect(page.locator('tbody > tr > :nth-child(7)')).toContainText('valid consent user');
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
    let id = await joomla.db_createUser();
    await joomla.db_createPrivacyConsent({
      state: 1,
      body: 'valid consent user',
      user_id: `${id}`
    });
    id = undefined;
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await page.locator('#filter_search').fill(`ID:${id}`);
    await page.locator('.filter-search-bar__button').click();
    await expect(page.locator('tbody > tr > :nth-child(7)')).toContainText('valid consent user');
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
    await page.locator('#list_limit').selectOption({
      label: '5'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(6);
    await page.locator('#list_limit').selectOption({
      label: '10'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(11);
    await page.locator('#list_limit').selectOption({
      label: '15'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(16);
    await page.locator('#list_limit').selectOption({
      label: '20'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(21);
    await page.locator('#list_limit').selectOption({
      label: '25'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(26);
    await page.locator('#list_limit').selectOption({
      label: '30'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(31);
    await page.locator('#list_limit').selectOption({
      label: '50'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(51);
    await page.locator('#list_limit').selectOption({
      label: '100'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(101);
    await page.locator('#list_limit').selectOption({
      label: '200'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(201);
    await page.locator('#list_limit').selectOption({
      label: '500'
    });
    await expect(page.locator('table').locator('tr')).toHaveCount(501);
    await page.locator('#list_limit').selectOption({
      label: 'All'
    });
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Status ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Status descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Username ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Username descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Name descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Name ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'User ID ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'User ID descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Subject ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Subject descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Consented descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'Consented ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'ID descending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
    await page.goto('/administrator/index.php?option=com_privacy&view=consents');
    await expect(page.locator('tbody > tr > :nth-child(4)')).toContainText('test user');
    await expect(page.locator('table').locator('tr')).toHaveCount(4);
    await page.locator('#list_fullordering').selectOption({
      label: 'ID ascending'
    });
    await page.waitForResponse(resp => resp.request().method() === "POST" && /.*.*/administrator/index\.php\?option=com_privacy&view=consents/.test(resp.url()));
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
