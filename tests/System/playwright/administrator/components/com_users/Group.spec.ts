// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the user group form', () => {
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
    await joomla.queryDB("DELETE FROM #__usergroups WHERE title = 'test group'");
  });
  test('can create a new group', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&task=group.add');
    await page.locator('#jform_title').fill('test group');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Group saved.');
    await expect(page.getByText('test group').filter({ visible: true }).first()).toBeVisible();
  });
  test('can edit a group', async ({
    page,
    joomla
  }) => {
    const group = await joomla.db_createUserGroup();
    await page.goto(`/administrator/index.php?option=com_users&task=group.edit&id=${group.id}`);
    await page.locator('#jform_title').fill('test group edited');
    await joomla.clickToolbarButton('Save');
    await joomla.checkForSystemMessage('Group saved.');
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&task=group.add');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_users&view=groups/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
});
