// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the action logs', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_enableExtension('1', 'plg_actionlog_joomla');
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('User Actions Log');
  });
  test('can display no results', async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('TRUNCATE #__action_logs');
    await page.reload();
    await expect(page.locator('div.alert.alert-info')).toContainText('No Matching Results');
  });
  test('can display a list of actions', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogout();
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await expect(page.getByText(`User ${joomla.expose.username} logged in to admin`).first()).toBeVisible();
    await joomla.queryDB('TRUNCATE #__action_logs');
  });
  test('has an export button', async ({
    page,
    joomla
  }) => {
    await page.locator('#toolbar-download1').click();
    await joomla.checkForSystemMessage('There are no User Action logs to export');
  });
  test('can clear logs', async ({
    page,
    joomla
  }) => {
    await page.locator('#toolbar-delete1').click();
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('All User Action logs have been deleted');
  });
  test('can delete selected logs', async ({
    page,
    joomla
  }) => {
    await page.locator('#toolbar-delete').click();
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Please first make a selection from the list');
    console.log('Make a selection first');
    await joomla.doAdministratorLogout();
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_actionlogs&view=actionlogs');
    await joomla.checkAllResults();
    await page.locator('#toolbar-delete').click();
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('logs deleted');
    await joomla.queryDB('TRUNCATE #__action_logs');
  });
});
