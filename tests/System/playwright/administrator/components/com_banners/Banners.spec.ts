// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the banners list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_banners&view=banners&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Banners');
  });
  test('can display a list of banners', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'Test banner'
    });
    await page.reload();
    await expect(page.getByText('Test banner').filter({ visible: true }).first()).toBeVisible();
  });
  test('can open the banner form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Banners: New').filter({ visible: true }).first()).toBeVisible();
  });
  test('can publish the test banner', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'Test banner',
      state: 0
    });
    await page.reload();
    await joomla.searchForItem('Test banner');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Banner published.');
  });
  test('can unpublish the test banner', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'Test banner',
      state: 1
    });
    await page.reload();
    await joomla.searchForItem('Test banner');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Banner unpublished.');
  });
  test('can trash the test banner', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'Test banner'
    });
    await page.reload();
    await joomla.searchForItem('Test banner');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Banner trashed.');
  });
  test('can delete the test banner', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'Test banner',
      state: -2
    });
    await page.reload();
    await joomla.setFilter('published', 'Trashed');
    await joomla.searchForItem('Test banner');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Banner deleted.');
  });
});
