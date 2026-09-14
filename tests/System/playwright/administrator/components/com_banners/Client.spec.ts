// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the banner clients form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_banners&view=clients&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__banner_clients WHERE name = 'test banner client'");
  });
  test('can create a client', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_banners&task=client.add');
    await page.locator('#jform_name').fill('test banner client');
    await page.locator('#jform_contact').fill('test banner client');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Client saved.');
    await expect(page.getByText('test banner client').filter({ visible: true }).first()).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_banners&task=client.add');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_banners&view=clients/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
  test('can edit a client', async ({
    page,
    joomla
  }) => {
    const bannerClient = await joomla.db_createBannerClient({
      name: 'test client'
    });
    await page.goto(`/administrator/index.php?option=com_banners&task=client.edit&id=${bannerClient.id}`);
    await page.locator('#jform_name').fill('test banner client');
    await page.locator('#jform_contact').fill('test banner');
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.getByText('test banner client').filter({ visible: true }).first()).toBeVisible();
  });
});
