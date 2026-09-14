// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the menu list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_menus&view=items&menutype=mainmenu');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Menus: Items');
  });
  test('can display a list of menu items', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Test menu item'
    });
    await page.reload();
    await expect(page.getByText('Test menu item').filter({ visible: true }).first()).toBeVisible();
  });
  test('can open the menu item form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Menus: New Item').filter({ visible: true }).first()).toBeVisible();
  });
  test('can create a system link menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteMenuItem({
      title: 'can create menu item'
    });
    await page.goto('administrator/index.php?option=com_menus&task=item.add');
    await expect(page.getByText('Menus: New Item').filter({ visible: true }).first()).toBeVisible();
    await page.locator('#jform_title').fill('can create menu item');
    await page.locator('button[data-modal-config*="Menu Item Type"]').first().click();
    await expect(page.getByText('Menu Item Type').filter({ visible: true }).first()).toBeVisible();
    const $body = page.frameLocator('iframe');
    await $body.locator('.accordion-button').filter({
      hasText: 'System Links'
    }).click();
    await $body.locator('a[data-type="url"]').click();
    await page.locator('input[name="jform[link]"]').click();
    await page.locator('input[name="jform[link]"]').fill('#');
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.locator('#system-message-container').filter({
      hasText: 'Menu item saved.'
    })).toBeVisible();
  });
  test('can delete the test menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Test menu item'
    });
    await joomla.searchForItem('Test menu item');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Menu item trashed.');
  });
});
