// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the newsfeed form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__newsfeeds WHERE name = 'Test newsfeed'");
  });
  test('can create a newsfeed', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_newsfeeds&task=newsfeed.add');
    await page.locator('#jform_name').fill('Test newsfeed');
    await page.locator('#jform_link').fill('https://newsfeedtesturl');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('News feed saved.');
    await expect(page.getByText('Test newsfeed')).toBeVisible();
  });
  test('can change access level of a test newsfeed', async ({
    page,
    joomla
  }) => {
    const feed = await joomla.db_createNewsFeed({
      name: 'Test newsfeed',
      link: 'https://newsfeedtesturl'
    });
    await page.goto(`/administrator/index.php?option=com_newsfeeds&task=newsfeed.edit&id=${feed.id}`);
    await page.locator('#jform_access').selectOption({
      label: 'Special'
    });
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.locator('td').filter({
      hasText: 'Special'
    })).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('administrator/index.php?option=com_newsfeeds&task=newsfeed.add');
    await joomla.clickToolbarButton('Cancel');
    await page.waitForResponse(resp => /index\.php\?option=com_newsfeeds&view=newsfeeds/.test(resp.url()));
  });
});
