// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the newsfeeds list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_newsfeeds&view=newsfeeds&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('News Feeds');
  });
  test('can display a list of newsfeeds', async ({
    page,
    joomla
  }) => {
    await joomla.db_createNewsFeed({
      name: 'Test newsfeed'
    });
    await page.reload();
    await expect(page.getByText('Test newsfeed')).toBeVisible();
  });
  test('can open the newsfeed form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('News Feeds: New')).toBeVisible();
  });
  test('can publish the test newsfeed', async ({
    page,
    joomla
  }) => {
    await joomla.db_createNewsFeed({
      name: 'Test newsfeed',
      link: 'https://newsfeedtesturl',
      published: 0
    });
    await page.reload();
    await joomla.searchForItem('Test newsfeed');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').click();
    await joomla.checkForSystemMessage('News feed published.');
  });
  test('can unpublish the test newsfeed', async ({
    page,
    joomla
  }) => {
    await joomla.db_createNewsFeed({
      name: 'Test newsfeed',
      link: 'https://newsfeedtesturl',
      published: 1
    });
    await page.reload();
    await joomla.searchForItem('Test newsfeed');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').click();
    await joomla.checkForSystemMessage('News feed unpublished.');
  });
  test('can trash the test newsfeed', async ({
    page,
    joomla
  }) => {
    await joomla.db_createNewsFeed({
      name: 'Test newsfeed',
      link: 'https://newsfeedtesturl'
    });
    await page.reload();
    await joomla.searchForItem('Test newsfeed');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').click();
    await joomla.checkForSystemMessage('News feed trashed.');
  });
  test('can delete the test newsfeed', async ({
    page,
    joomla
  }) => {
    await joomla.db_createNewsFeed({
      name: 'Test newsfeed',
      link: 'https://newsfeedtesturl',
      published: -2
    });
    await page.reload();
    await joomla.setFilter('published', 'Trashed');
    await joomla.searchForItem('Test newsfeed');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('News feed deleted.');
  });
});
