// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the custom tags list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_tags&view=tags&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Tags');
  });
  test('can display a list of tags', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'Test tag'
    });
    await page.reload();
    await expect(page.getByText('Test tag')).toBeVisible();
  });
  test('can open the tag form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Tags: New')).toBeVisible();
  });
  test('can publish the test tag', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'Test tag',
      published: 0
    });
    await page.reload();
    await joomla.searchForItem('Test tag');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').click();
    await joomla.checkForSystemMessage('Tag published');
  });
  test('can unpublish the test tag', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'Test tag',
      published: 1
    });
    await page.reload();
    await joomla.searchForItem('Test tag');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').click();
    await joomla.checkForSystemMessage('Tag unpublished');
  });
  test('can trash the test tag', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'Test tag'
    });
    await page.reload();
    await joomla.searchForItem('Test tag');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').click();
    await joomla.checkForSystemMessage('Tag trashed');
  });
  test('can delete the test tag', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'Test tag',
      published: -2
    });
    await page.reload();
    await joomla.setFilter('published', 'Trashed');
    await joomla.searchForItem('Test tag');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Tag deleted');
  });
});
