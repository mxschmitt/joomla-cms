// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the banner module', () => {
  test('can display banners', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      custombannercode: 'automated test banner 1'
    });
    await joomla.db_createBanner({
      custombannercode: 'automated test banner 2'
    });
    await joomla.db_createBanner({
      custombannercode: 'automated test banner 3'
    });
    await joomla.db_createBanner({
      custombannercode: 'automated test banner 4'
    });
    await joomla.db_createModule({
      title: 'automated test',
      module: 'mod_banners',
      params: '{"count":5 }'
    });
    await page.goto('/');
    await expect(page.getByText('automated test banner 1').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test banner 2').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test banner 3').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test banner 4').filter({ visible: true }).first()).toBeVisible();
  });
});
