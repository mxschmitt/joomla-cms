// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the user access level list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=levels&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Users: Viewing Access Level');
  });
  test('can display a list of access levels', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUserLevel({
      title: 'Test level'
    });
    await page.reload();
    await expect(page.getByText('Test level')).toBeVisible();
  });
  test('can open the access level form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('User Groups With Viewing Access')).toBeVisible();
  });
  test('can delete the test level', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUserLevel({
      title: 'Test level'
    });
    await joomla.searchForItem('Test level');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Delete');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('View Access Level removed.');
  });
});
