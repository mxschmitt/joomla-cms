// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the newsfeeds categories view', () => {
  test('can display a list of categories', async ({
    page,
    joomla
  }) => {
    let id = await joomla.db_createCategory({
      title: 'automated test category 1',
      extension: 'com_newsfeeds'
    });
    await joomla.db_createNewsFeed({
      name: 'automated test feed 1',
      catid: id
    });
    id = await joomla.db_createCategory({
      title: 'automated test category 2',
      extension: 'com_newsfeeds'
    });
    await joomla.db_createNewsFeed({
      name: 'automated test feed 2',
      catid: id
    });
    await joomla.db_createNewsFeed({
      name: 'automated test feed 3',
      catid: id
    });
    await page.goto('/index.php?option=com_newsfeeds&view=categories');
    await expect(page.getByText('automated test category 1').first()).toBeVisible();
    await expect(page.getByText('automated test category 2').first()).toBeVisible();
    await expect(page.locator(':nth-child(2) > .page-header > .badge').filter({
      hasText: '# News feeds 1'
    })).toBeVisible();
    await expect(page.locator(':nth-child(3) > .page-header > .badge').filter({
      hasText: '# News feeds 2'
    })).toBeVisible();
  });
});
