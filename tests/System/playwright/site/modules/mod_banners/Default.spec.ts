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
    await expect(page.getByText('automated test banner 1')).toBeVisible();
    await expect(page.getByText('automated test banner 2')).toBeVisible();
    await expect(page.getByText('automated test banner 3')).toBeVisible();
    await expect(page.getByText('automated test banner 4')).toBeVisible();
  });
});
