// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the feed module', () => {
  ['joomla.org'].forEach(file => {
    test('can display feed', async ({
      page,
      joomla
    }) => {
      await joomla.db_createModule({
        title: 'automated test feed',
        module: 'mod_feed',
        params: `{"rssurl": "${Cypress.config('baseUrl').replace('https://', 'http://')}/tests/System/data/com_newsfeeds/${file}.xml" }`
      });
      await page.goto('/');
      await expect(page.getByText('automated test feed')).toBeVisible();
      await expect(page.locator('ul.newsfeed')).toBeVisible();
      await expect(page.locator('ul.newsfeed')).toHaveCount(3);
    });
  });
});
