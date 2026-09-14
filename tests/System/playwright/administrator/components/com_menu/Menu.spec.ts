// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the menu form', () => {
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
    await joomla.queryDB("DELETE FROM #__menu_types WHERE menutype = 'test'");
  });
  test('can create a new menu', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_menus&task=menu.add');
    await page.locator('#jform_title').fill('test menu');
    await page.locator('#jform_menutype').fill('test');
    await page.locator('#jform_menudescription').fill('test description');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Menu saved');
    await expect(page.getByText('test menu').filter({ visible: true }).first()).toBeVisible();
  });
});
