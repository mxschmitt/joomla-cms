// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the latest articles module', () => {
  test('can load without ordering parameter', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article'
    });
    await joomla.db_createModule({
      module: 'mod_articles_latest'
    });
    await page.goto('/');
    await expect(page.locator('li').filter({
      hasText: 'automated test article'
    })).toBeVisible();
  });
});
