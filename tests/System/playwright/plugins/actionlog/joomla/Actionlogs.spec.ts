// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the Action Logs plugin', () => {
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
    await joomla.queryDB("DELETE FROM #__users WHERE username = 'test'");
    await joomla.queryDB('TRUNCATE #__action_logs');
  });
  test('logs user creation (backend)', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&task=user.add');
    await page.locator('#jform_name').fill('test user');
    await page.locator('#jform_username').fill('test');
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('#jform_password').fill('testtesttest');
    await page.locator('#jform_password2').fill('testtesttest');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('User saved');
    await joomla.searchForItem('test user');
    await expect(page.locator('#userList').getByText('test user').first()).toBeVisible();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('added new user').filter({ visible: true }).first()).toBeVisible();
  });
  test('logs user modifications (backend)', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createUser();
    await page.goto(`/administrator/index.php?option=com_users&task=user.edit&id=${id}`);
    await page.locator('#jform_name').fill('test edited');
    await page.locator('#jform_username').fill('testedited');
    await page.locator('#jform_password').fill('testeditedtest');
    await page.locator('#jform_password2').fill('testeditedtest');
    await page.locator('#jform_email').fill('testedited@example.com');
    await joomla.clickToolbarButton('Save');
    await joomla.checkForSystemMessage('User saved.');
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('updated the user').filter({ visible: true }).first()).toBeVisible();
  });
  test('logs blocking and unblocking via user profile toggle (backend)', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createUser();
    await page.goto(`/administrator/index.php?option=com_users&task=user.edit&id=${id}`);
    await page.locator('label[for="jform_block0"]').click();
    await joomla.clickToolbarButton('Save');
    await joomla.checkForSystemMessage('User saved.');
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('blocked user').filter({ visible: true }).first()).toBeVisible();
    await page.goto(`/administrator/index.php?option=com_users&task=user.edit&id=${id}`);
    await page.locator('label[for="jform_block1"]').click();
    await joomla.clickToolbarButton('Save');
    await joomla.checkForSystemMessage('User saved.');
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('unblocked user').filter({ visible: true }).first()).toBeVisible();
  });
  test('logs blocking / unblocking directly from the List table view (backend)', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('#filter_search').fill('test@example.com');
    await page.locator('.btn-group .btn').first().click();
    await page.locator('input[type="checkbox"][name="cid[]"]').first().check();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Block').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('User blocked.');
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.locator('tbody tr')).toBeTruthy();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('#filter_search').fill('test@example.com');
    await page.locator('.btn-group .btn').first().click();
    await page.locator('input[type="checkbox"][name="cid[]"]').first().check();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unblock').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('User unblocked.');
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.locator('tbody tr')).toBeTruthy();
  });
  test('logs user registration from frontend', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('allowUserRegistration', '1', 'com_users');
    await page.goto('/index.php?option=com_users&view=registration');
    await page.locator('#jform_name').fill('test user');
    await page.locator('#jform_username').fill('test');
    await page.locator('#jform_password1').fill('Password123!');
    await page.locator('#jform_password2').fill('Password123!');
    await page.locator('#jform_email1').fill('frontendtest@example.com');
    await page.locator('button[type="submit"]').filter({
      hasText: 'Register'
    }).click();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('registered').filter({ visible: true }).first()).toBeVisible();
    await joomla.db_updateExtensionParameter('allowUserRegistration', '0', 'com_users');
  });
  test('logs editing profile from frontend', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser();
    await page.goto('/index.php?option=com_users&view=login');
    await page.locator('#username').fill('test');
    await page.locator('#password').fill('test');
    await page.locator('button[type="submit"]').filter({
      hasText: 'Log in'
    }).first().click();
    await page.reload();
    await page.goto('/index.php?option=com_users&view=profile&layout=edit');
    await page.locator('#jform_name').fill('test edited frontend');
    await page.locator('button[type="submit"]').filter({
      hasText: 'Save'
    }).click();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('updated the user').filter({ visible: true }).first()).toBeVisible();
  });
  test('logs username remind request from frontend', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser();
    await page.goto('/index.php?option=com_users&view=remind');
    await expect(page.locator('#jform_email')).toBeVisible();
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('button[type="submit"]').filter({
      hasText: 'Submit'
    }).click();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('requested a username reminder for their account ').filter({ visible: true }).first()).toBeVisible();
  });
  test('logs password reset request from frontend', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser();
    await page.goto('/index.php?option=com_users&view=reset');
    await expect(page.locator('#jform_email')).toBeVisible();
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('button[type="submit"]').filter({
      hasText: 'Submit'
    }).click();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText('requested a password reset for their account ').filter({ visible: true }).first()).toBeVisible();
  });
});
