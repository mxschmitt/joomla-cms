// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the banners form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_banners&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__banners WHERE name = 'Test banner'");
  });
  test('can create a banner', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_banners&task=banner.add');
    await page.locator('#jform_name').fill('Test banner');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Banner saved.');
    await expect(page.getByText('Test banner').filter({ visible: true }).first()).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_banners&task=banner.add');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_banners&view=banners/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
  test('can edit a banner', async ({
    page,
    joomla
  }) => {
    const banner = await joomla.db_createBanner({
      name: 'Test Banner'
    });
    await page.goto(`/administrator/index.php?option=com_banners&task=banner.edit&id=${banner.id}`);
    await page.locator('#jform_name').fill('Test banner edited');
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.getByText('Test banner edited').filter({ visible: true }).first()).toBeVisible();
  });
});
