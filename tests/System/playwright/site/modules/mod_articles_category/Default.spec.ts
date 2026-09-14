// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the articles category module', () => {
  test('can display the title of the articles', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_content'
    });
    await joomla.db_createArticle({
      title: 'automated test article',
      catid: categoryId
    });
    await joomla.db_createModule({
      module: 'mod_articles_category',
      params: JSON.stringify({
        catid: categoryId
      })
    });
    await page.goto('/');
    await expect(page.locator('li').filter({
      hasText: 'automated test article'
    })).toBeVisible();
  });
});
