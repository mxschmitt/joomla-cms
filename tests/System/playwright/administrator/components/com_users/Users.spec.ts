// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the user list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Users');
  });
  test('can display a list of users', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'Test user'
    });
    await page.reload();
    await expect(page.getByText('Test user').filter({ visible: true }).first()).toBeVisible();
  });
  test('can open the user form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('New User Details').filter({ visible: true }).first()).toBeVisible();
  });
  test('can delete the test user', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'Test user'
    });
    await joomla.searchForItem('Test user');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Delete').filter({ visible: true }).first().click();
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('User deleted.');
  });
  test('can filter state', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'Test user 1',
      username: 'test1',
      block: 0
    });
    await joomla.db_createUser({
      name: 'Test user 2',
      username: 'test2',
      block: 1
    });
    await page.reload();
    await expect(page.locator('#userList')).toContainText('Test user 1');
    await expect(page.locator('#userList')).toContainText('Test user 2');
    await joomla.setFilter('state', 'Enabled');
    await expect(page.locator('#userList')).toContainText('Test user 1');
    await expect(page.locator('#userList')).not.toContainText('Test user 2');
    await joomla.setFilter('state', 'Disabled');
    await expect(page.locator('#userList')).not.toContainText('Test user 1');
    await expect(page.locator('#userList')).toContainText('Test user 2');
  });
  test('can filter group', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'Test user 1',
      username: 'test1',
      group_id: 2
    });
    await joomla.db_createUser({
      name: 'Test user 2',
      username: 'test2',
      group_id: 6
    });
    await page.reload();
    await expect(page.locator('#userList')).toContainText('Test user 1');
    await expect(page.locator('#userList')).toContainText('Test user 2');
    await joomla.setFilter('group_id', '- Registered');
    await expect(page.locator('#userList')).toContainText('Test user 1');
    await expect(page.locator('#userList')).not.toContainText('Test user 2');
    await joomla.setFilter('group_id', '- Manager');
    await expect(page.locator('#userList')).not.toContainText('Test user 1');
    await expect(page.locator('#userList')).toContainText('Test user 2');
    await joomla.setFilter('group_id', '- Super Users');
    await expect(page.locator('#userList')).not.toContainText('Test user 1');
    await expect(page.locator('#userList')).not.toContainText('Test user 2');
  });
});
