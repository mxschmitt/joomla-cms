// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the articles archive module', () => {
  test('can display a list of months with archived articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      state: 2,
      created: '2022-09-09 20:00:00',
      modified: '2022-09-09 20:00:00'
    });
    await joomla.db_createModule({
      module: 'mod_articles_archive'
    });
    await page.goto('/');
    await expect(page.locator('li').filter({
      hasText: 'September, 2022'
    })).toBeVisible();
  });
});
