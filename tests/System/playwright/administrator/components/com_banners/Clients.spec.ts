// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the clients list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_banners&view=clients&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Banners: Clients');
  });
  test('can display a list of clients', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBannerClient({
      name: 'test banner client'
    });
    await page.reload();
    await expect(page.getByText('test banner client')).toBeVisible();
  });
  test('can open the clients form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Banners: New Client')).toBeVisible();
  });
  test('can publish the test client', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBannerClient({
      name: 'test banner client',
      state: 0
    });
    await page.reload();
    await joomla.searchForItem('test banner client');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').click();
    await joomla.checkForSystemMessage('Client published.');
  });
  test('can unpublish the test client', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBannerClient({
      name: 'test banner client',
      state: 1
    });
    await page.reload();
    await joomla.searchForItem('test banner client');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').click();
    await joomla.checkForSystemMessage('Client unpublished.');
  });
  test('can trash the test client', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBannerClient({
      name: 'test banner client'
    });
    await page.reload();
    await joomla.searchForItem('test banner client');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').click();
    await joomla.checkForSystemMessage('Client trashed.');
  });
  test('can delete the test client', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBannerClient({
      name: 'test banner client',
      state: -2
    });
    await page.reload();
    await joomla.setFilter('state', 'Trashed');
    await joomla.searchForItem('test banner client');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Client deleted.');
  });
});
