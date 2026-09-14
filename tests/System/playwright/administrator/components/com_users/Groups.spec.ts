// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the user group list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=groups&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Users: Groups');
  });
  test('can display a list of groups', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUserGroup({
      title: 'Test group'
    });
    await page.reload();
    await expect(page.getByText('Test group').filter({ visible: true }).first()).toBeVisible();
  });
  test('can open the group form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('User Group Details').filter({ visible: true }).first()).toBeVisible();
  });
  test('can delete the test group', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUserGroup({
      title: 'Test group'
    });
    await joomla.searchForItem('Test group');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Delete');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('User Group deleted.');
  });
});
