// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the cache', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_cache&view=cache');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Maintenance: Clear Cache');
  });
  test('can display message', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('div.alert.alert-info')).toContainText('Select the Clear Expired Cache button');
  });
  test('can display a list of cached items', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('tr.row0')).toContainText('_media_version');
  });
  test('can clear expired cache', async ({
    page,
    joomla
  }) => {
    await page.locator('#toolbar-delete2').click();
    const $body = page.locator('body');
    if ($body.find('div.buttons-holder button[data-button-ok]').length > 0) {
      await page.locator('div.buttons-holder button[data-button-ok]').click();
    }
    await joomla.checkForSystemMessage('Expired cached items have been cleared');
  });
  test('can delete all', async ({
    page,
    joomla
  }) => {
    await page.locator('#toolbar-delete1').click();
    await joomla.checkForSystemMessage('All cache group(s) have been cleared');
  });
});
