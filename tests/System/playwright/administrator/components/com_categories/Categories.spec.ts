// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the categories list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_categories&view=categories&extension=com_content&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1').filter({
      hasText: 'Categories'
    })).toBeVisible();
  });
  test('can display a list of categories', async ({
    page,
    joomla
  }) => {
    await joomla.db_createCategory({
      title: 'Test category'
    });
    await page.reload();
    await expect(page.getByText('Test category')).toBeVisible();
  });
  test('can open the category form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('New Category')).toBeVisible();
  });
  test('can publish the test category', async ({
    page,
    joomla
  }) => {
    await joomla.db_createCategory({
      title: 'Test category',
      published: 0
    });
    await page.reload();
    await joomla.searchForItem('Test category');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').click();
    await joomla.checkForSystemMessage('Category published.');
  });
  test('can unpublish the test category', async ({
    page,
    joomla
  }) => {
    await joomla.db_createCategory({
      title: 'Test category',
      published: 1
    });
    await page.reload();
    await joomla.searchForItem('Test category');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').click();
    await joomla.checkForSystemMessage('Category unpublished.');
  });
  test('can trash the test category', async ({
    page,
    joomla
  }) => {
    await joomla.db_createCategory({
      title: 'Test category'
    });
    await page.reload();
    await joomla.searchForItem('Test category');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').click();
    await joomla.checkForSystemMessage('Category trashed.');
  });
  test('can delete the test category', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_categories&task=category.add&extension=com_content');
    await page.locator('#jform_title').fill('Test category');
    await page.locator('#jform_published').selectOption({
      label: 'Trashed'
    });
    await joomla.clickToolbarButton('Save & Close');
    await joomla.setFilter('published', 'Trashed');
    await joomla.searchForItem('Test category');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Category deleted.');
  });
});
