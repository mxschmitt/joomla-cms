// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content featured view', () => {
  test('can display an article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article',
      featured: 1
    });
    await page.goto('/');
    await expect(page.getByText('automated test article')).toBeVisible();
  });
  test('can not display not featured articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article',
      featured: 0
    });
    await page.goto('/');
    await expect(page.getByText('automated test article')).toHaveCount(0);
  });
  test('can navigate to the article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article',
      featured: 1
    });
    await page.goto('/');
    await page.locator('.item-title a').click();
    await expect(page.locator('h2').filter({
      hasText: 'automated test article'
    })).toBeVisible();
  });
  test('can navigate to the category', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article',
      featured: 1
    });
    await page.goto('/');
    await page.locator('.category-name a').click();
    await expect(page.locator('h1').filter({
      hasText: 'Uncategorised'
    })).toBeVisible();
  });
});
