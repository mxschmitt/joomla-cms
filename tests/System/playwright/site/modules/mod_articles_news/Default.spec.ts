// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the news module', () => {
  test('can display the title of the articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article'
    });
    await joomla.db_createModule({
      module: 'mod_articles_news',
      params: JSON.stringify({
        item_title: 1,
        item_heading: 'h3'
      })
    });
    await page.goto('/');
    await expect(page.locator('h3').filter({
      hasText: 'automated test article'
    })).toBeVisible();
  });
});
