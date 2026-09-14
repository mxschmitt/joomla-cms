// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content archived view', () => {
  test('can display archived articles in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test archive article',
      link: 'index.php?option=com_content&view=archive'
    });
    await joomla.db_createArticle({
      title: 'article 1',
      state: 2
    });
    await joomla.db_createArticle({
      title: 'article 2',
      state: 2
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test archive article' }).click();
    await expect(page.getByText('article 1').first()).toBeVisible();
    await expect(page.getByText('article 2').first()).toBeVisible();
  });
  test('can display archived articles without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'article 1',
      state: 2
    });
    await joomla.db_createArticle({
      title: 'article 2',
      state: 2
    });
    await page.goto('/index.php?option=com_content&view=archive');
    await expect(page.getByText('article 1').first()).toBeVisible();
    await expect(page.getByText('article 2').first()).toBeVisible();
  });
  test('can not display not archived articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test archive article',
      link: 'index.php?option=com_content&view=archive'
    });
    await joomla.db_createArticle({
      title: 'article 1',
      state: 2
    });
    await joomla.db_createArticle({
      title: 'article 2',
      state: 1
    });
    await joomla.db_createArticle({
      title: 'article 3',
      state: 0
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test archive article' }).click();
    await expect(page.getByText('article 1').first()).toBeVisible();
    await expect(page.getByText('article 2').first()).toHaveCount(0);
    await expect(page.getByText('article 3').first()).toHaveCount(0);
  });
});
