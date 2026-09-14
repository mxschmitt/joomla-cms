// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the related items module', () => {
  test('can display a list of related articles based on the metakey field', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Main Article',
      metakey: 'joomla',
      featured: 1
    });
    await joomla.db_createArticle({
      title: 'article with joomla keyword',
      metakey: 'joomla'
    });
    await joomla.db_createModule({
      module: 'mod_related_items'
    });
    await page.goto('/');
    await page.locator('a').filter({
      hasText: 'Main Article'
    }).click();
    await expect(page.locator('li').filter({
      hasText: 'article with joomla keyword'
    })).toBeVisible();
  });
});
