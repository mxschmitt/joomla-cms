// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the Smart Search', () => {
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
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'Test article'");
  });
  test('can index an article', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article');
    await joomla.clickToolbarButton('Save & Close');
    await page.goto('/administrator/index.php?option=com_finder&view=index');
    await expect(page.getByText('Test article')).toBeVisible();
  });
  test('can purge the index', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_finder&view=index');
    await page.locator('#toolbar-maintenance-group > button').click();
    await page.locator('#maintenance-group-children-index-purge > button').click();
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('All items have been deleted.');
  });
});
