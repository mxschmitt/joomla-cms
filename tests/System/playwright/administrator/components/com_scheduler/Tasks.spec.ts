// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the tasks list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__scheduler_tasks WHERE title = 'Test task'");
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText(' Scheduled Tasks');
  });
  test('can display a list of tasks', async ({
    page,
    joomla
  }) => {
    await expect(page.getByText('Update Notification').first()).toBeVisible();
  });
  test('can open the task list', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Select a Task type').first()).toBeVisible();
    await expect(page.getByText('GET Request').first()).toBeVisible();
  });
  test('can publish the test task', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await page.locator('#comSchedulerSelectSearch').fill('GET');
    await page.locator('a[href*="plg_task_requests_task_get"]').click();
    await page.locator('#jform_title').fill('Test task');
    await page.locator('#jform_params_url').fill('www.test.task');
    await page.locator('#jform_execution_rules_interval_minutes').fill('1');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Item saved');
  });
  test('can unpublish the test task', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await page.locator('#comSchedulerSelectSearch').fill('GET');
    await page.locator('a[href*="plg_task_requests_task_get"]').click();
    await page.locator('#jform_title').fill('Test task');
    await page.locator('#jform_params_url').fill('www.test.task');
    await page.locator('#jform_execution_rules_interval_minutes').fill('1');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Item saved');
    await page.reload();
    await joomla.searchForItem('Test task');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Disable').first().click();
    await joomla.checkForSystemMessage('Task disabled');
  });
  test('can trash the test task', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await page.locator('#comSchedulerSelectSearch').fill('GET');
    await page.locator('a[href*="plg_task_requests_task_get"]').click();
    await page.locator('#jform_title').fill('Test task');
    await page.locator('#jform_params_url').fill('www.test.task');
    await page.locator('#jform_execution_rules_interval_minutes').fill('1');
    await page.locator('#jform_state').selectOption({
      label: 'Disabled'
    });
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Item saved');
    await page.reload();
    await joomla.searchForItem('Test task');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').first().click();
    await joomla.checkForSystemMessage('Task trashed');
  });
  test('can delete the test task', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await page.locator('#comSchedulerSelectSearch').fill('GET');
    await page.locator('a[href*="plg_task_requests_task_get"]').click();
    await page.locator('#jform_title').fill('Test task');
    await page.locator('#jform_params_url').fill('www.test.task');
    await page.locator('#jform_execution_rules_interval_minutes').fill('1');
    await page.locator('#jform_state').selectOption({
      label: 'Trashed'
    });
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Item saved');
    await page.reload();
    await joomla.setFilter('state', 'Trashed');
    await joomla.searchForItem('Test task');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Task deleted');
  });
});
