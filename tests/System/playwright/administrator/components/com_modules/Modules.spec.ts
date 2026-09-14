// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the module list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_modules&view=modules&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Modules');
  });
  test('can display a list of modules', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Test module',
      module: 'mod_custom'
    });
    await page.reload();
    await expect(page.getByText('Test module').first()).toBeVisible();
  });
  test('can open the module list', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Select a Module Type').first()).toBeVisible();
  });
  test('can publish the test module', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Test module',
      module: 'mod_custom',
      published: 0
    });
    await page.reload();
    await joomla.searchForItem('Test module');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').first().click();
    await joomla.checkForSystemMessage('Module published');
  });
  test('can unpublish the test module', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Test module',
      module: 'mod_custom',
      published: 1
    });
    await page.reload();
    await joomla.searchForItem('Test module');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').first().click();
    await joomla.checkForSystemMessage('Module unpublished');
  });
  test('can trash the test module', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Test module',
      module: 'mod_custom'
    });
    await page.reload();
    await joomla.searchForItem('Test module');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').first().click();
    await joomla.checkForSystemMessage('Module trashed');
  });
  test('can delete the test module', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Test module',
      module: 'mod_custom',
      published: -2
    });
    await page.reload();
    await joomla.setFilter('state', 'Trashed');
    await joomla.searchForItem('Test module');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Module deleted');
  });
});
