// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the articles list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_content&view=articles&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Articles');
  });
  test('can display a list of articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article'
    });
    await page.reload();
    await expect(page.getByText('Test article').filter({ visible: true }).first()).toBeVisible();
  });
  test('can open the article form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Articles: New').filter({ visible: true }).first()).toBeVisible();
  });
  test('can publish the test article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      state: 0
    });
    await page.reload();
    await joomla.searchForItem('Test article');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Article published.');
  });
  test('can unpublish the test article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      state: 1
    });
    await page.reload();
    await joomla.searchForItem('Test article');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Article unpublished.');
  });
  test('can feature the test article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      featured: 0
    });
    await page.reload();
    await joomla.searchForItem('Test article');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.locator('.button-featured').filter({
      hasText: 'Feature'
    }).click();
    await joomla.checkForSystemMessage('Article featured.');
  });
  test('can unfeature the test article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      featured: 1
    });
    await page.reload();
    await joomla.searchForItem('Test article');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unfeature').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Article unfeatured.');
  });
  test('can trash the test article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article'
    });
    await page.reload();
    await joomla.searchForItem('Test article');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').filter({ visible: true }).first().click();
    await joomla.checkForSystemMessage('Article trashed.');
  });
  test('can delete the test article', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      state: -2
    });
    await page.reload();
    await joomla.setFilter('published', 'Trashed');
    await joomla.searchForItem('Test article');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Article deleted.');
  });
  test('can select articles with multiselect', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article 1'
    });
    await joomla.db_createArticle({
      title: 'Test article 2'
    });
    await joomla.db_createArticle({
      title: 'Test article 3'
    });
    await joomla.db_createArticle({
      title: 'Test article 4'
    });
    await joomla.db_createArticle({
      title: 'Test article 5'
    });
    await page.reload();
    await joomla.searchForItem('Test article');
    await page.locator('#cb2').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb4').click();
    await joomla.clickToolbarButton('Action');
    await joomla.clickToolbarButton('Unpublish');
    await joomla.checkForSystemMessage('3 articles unpublished.');
    await expect(page.locator('thead input[name=\'checkall-toggle\']')).not.toBeChecked();
    await page.locator('#cb0').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb4').click();
    await expect(page.locator('thead input[name=\'checkall-toggle\']')).toBeChecked();
    await joomla.clickToolbarButton('Action');
    await joomla.clickToolbarButton('Unpublish');
    await joomla.checkForSystemMessage('2 articles unpublished.');
    await joomla.checkAllResults();
    await page.locator('#cb2').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb0').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb4').click();
    await joomla.clickToolbarButton('Action');
    await joomla.clickToolbarButton('Publish');
    await joomla.checkForSystemMessage('Article published.');
  });
});
