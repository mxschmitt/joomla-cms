// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the custom fields list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_fields&view=fields&context=com_content.article&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Fields');
  });
  test('can display a list of fields', async ({
    page,
    joomla
  }) => {
    await joomla.db_createField({
      title: 'Test field'
    });
    await page.reload();
    await expect(page.getByText('Test field')).toBeVisible();
  });
  test('can open the field form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('New Field')).toBeVisible();
  });
  test('can publish the test field', async ({
    page,
    joomla
  }) => {
    await joomla.db_createField({
      title: 'Test field',
      state: 0
    });
    await page.reload();
    await joomla.searchForItem('Test field');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').click();
    await joomla.checkForSystemMessage('Field published');
  });
  test('can unpublish the test field', async ({
    page,
    joomla
  }) => {
    await joomla.db_createField({
      title: 'Test field',
      state: 1
    });
    await page.reload();
    await joomla.searchForItem('Test field');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').click();
    await joomla.checkForSystemMessage('Field unpublished');
  });
  test('can trash the test field', async ({
    page,
    joomla
  }) => {
    await joomla.db_createField({
      title: 'Test field'
    });
    await page.reload();
    await joomla.searchForItem('Test field');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').click();
    await joomla.checkForSystemMessage('Field trashed');
  });
  test('can delete the test field', async ({
    page,
    joomla
  }) => {
    await joomla.db_createField({
      title: 'Test field',
      state: -2
    });
    await page.reload();
    await joomla.setFilter('state', 'Trashed');
    await joomla.searchForItem('Test field');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Field deleted');
  });
});
