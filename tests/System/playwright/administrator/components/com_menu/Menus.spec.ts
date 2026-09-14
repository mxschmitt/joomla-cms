// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the menu list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_menus&view=menus&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Menus');
  });
  test('can display a list of menus', async ({
    page,
    joomla
  }) => {
    await expect(page.getByText('Main Menu').filter({ visible: true }).first()).toBeVisible();
  });
  test('can open the menu form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Menus: Add').filter({ visible: true }).first()).toBeVisible();
  });
});
