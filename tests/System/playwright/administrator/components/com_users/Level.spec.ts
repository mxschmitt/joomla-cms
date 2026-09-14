// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the user access level form', () => {
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
    await joomla.queryDB("DELETE FROM #__viewlevels WHERE title = 'test level'");
  });
  test('can create a new access level', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&task=level.add');
    await page.locator('#jform_title').fill('test level');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Access level saved.');
    await expect(page.getByText('test level').first()).toBeVisible();
  });
  test('can edit an access level', async ({
    page,
    joomla
  }) => {
    const level = await joomla.db_createUserLevel();
    await page.goto(`/administrator/index.php?option=com_users&task=level.edit&id=${level.id}`);
    await page.locator('#jform_title').fill('test level edited');
    await joomla.clickToolbarButton('Save');
    await joomla.checkForSystemMessage('Access level saved.');
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&task=level.add');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_users&view=levels/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
});
