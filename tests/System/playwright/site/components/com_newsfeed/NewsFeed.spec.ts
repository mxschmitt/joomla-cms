// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the newsfeeds details view', () => {
  ['joomla.org'].forEach(file => {
    test(`can display a feed in a menu item from ${file}`, async ({
      page,
      joomla
    }) => {
      let feed = await joomla.db_createNewsFeed({
        name: 'automated test feed 1',
        link: `${joomla.config.baseURL.replace('https://', 'http://')}/tests/System/data/com_newsfeeds/${file}.xml`
      });
      await joomla.db_createMenuItem({
        title: 'automated test feeds',
        link: `index.php?option=com_newsfeeds&view=newsfeed&id=${feed.id}`
      });
      await page.goto('/');
      await page.locator('a').filter({ hasText: 'automated test feed' }).click();
      await expect(page.getByText('automated test feed 1').first()).toBeVisible();
      await expect(page.locator('.com-newsfeeds-newsfeed__items')).toBeVisible();
      await expect(page.locator('.com-newsfeeds-newsfeed__items').locator(":scope > *")).toHaveCount(5);
    });
    test(`can display a feed without a menu item from ${file}`, async ({
      page,
      joomla
    }) => {
      feed = await joomla.db_createNewsFeed({
        name: 'automated test feed 1',
        link: `${joomla.config.baseURL.replace('https://', 'http://')}/tests/System/data/com_newsfeeds/${file}.xml`
      });
      await page.goto(`/index.php?option=com_newsfeeds&view=newsfeed&id=${feed.id}`);
      await expect(page.getByText('automated test feed 1').first()).toBeVisible();
      await expect(page.locator('.com-newsfeeds-newsfeed__items')).toBeVisible();
      await expect(page.locator('.com-newsfeeds-newsfeed__items').locator(":scope > *")).toHaveCount(5);
    });
  });
});
