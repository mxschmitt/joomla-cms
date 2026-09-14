// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the articles categories module', () => {
  test('can display the title of the categories', async ({
    page,
    joomla
  }) => {
    await joomla.db_createCategory({
      title: 'automated test category'
    });
    await joomla.db_createModule({
      module: 'mod_articles_categories'
    });
    await page.goto('/');
    await expect(page.locator('li').filter({
      hasText: 'automated test category'
    })).toBeVisible();
  });
});
