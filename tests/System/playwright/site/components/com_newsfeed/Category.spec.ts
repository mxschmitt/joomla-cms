// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the newsfeeds category view', () => {
  test('can display a list of feeds in a menu item', async ({
    page,
    joomla
  }) => {
    let feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 1'
    });
    feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 2',
      catid: feed.catid
    });
    feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 3',
      catid: feed.catid
    });
    feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 4',
      catid: feed.catid
    });
    await joomla.db_createMenuItem({
      title: 'automated test feeds',
      link: `index.php?option=com_newsfeeds&view=category&id=${feed.catid}`
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test feeds'}).click();
    await expect(page.getByText('automated test feed 1')).toBeVisible();
    await expect(page.getByText('automated test feed 2')).toBeVisible();
    await expect(page.getByText('automated test feed 3')).toBeVisible();
    await expect(page.getByText('automated test feed 4')).toBeVisible();
  });
  test('can display a list of feeds without a menu item', async ({
    page,
    joomla
  }) => {
    let feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 1'
    });
    feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 2',
      catid: feed.catid
    });
    feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 3',
      catid: feed.catid
    });
    feed = await joomla.db_createNewsFeed({
      name: 'automated test feed 4',
      catid: feed.catid
    });
    await page.goto(`/index.php?option=com_newsfeeds&view=category&id=${feed.catid}`);
    await expect(page.getByText('automated test feed 1')).toBeVisible();
    await expect(page.getByText('automated test feed 2')).toBeVisible();
    await expect(page.getByText('automated test feed 3')).toBeVisible();
    await expect(page.getByText('automated test feed 4')).toBeVisible();
  });
});
