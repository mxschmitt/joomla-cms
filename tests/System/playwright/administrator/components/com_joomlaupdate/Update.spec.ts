// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test the update retrieval logic', () => {
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
    await joomla.db_setValidTufRoot();
  });
  test('Can fetch available updates with valid metadata', async ({
    page,
    joomla
  }) => {
    await joomla.db_setValidTufRoot();
    await page.goto('/administrator/index.php?option=com_joomlaupdate');
    await page.locator('#toolbar joomla-toolbar-button[task="update.purge"] button').click();
    await joomla.checkForSystemMessage('Checked for updates.');
  });
  test('Receives error fetching available updates with invalid metadata', async ({
    page,
    joomla
  }) => {
    await joomla.db_setInvalidTufRoot();
    await page.goto('/administrator/index.php?option=com_joomlaupdate');
    await page.locator('#confirmButton').click();
    await joomla.checkForSystemMessage('Update not possible because the offered update does not have enough signatures.');
  });
});
