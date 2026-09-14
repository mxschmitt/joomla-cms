// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the task notification system plugin', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
    await joomla.doAdministratorLogin();
  });
  test('can display notification form', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks');
    await joomla.clickToolbarButton('New');
    await page.locator('div.new-task-details').filter({
      hasText: 'Delete ActionLogs'
    }).click();
    await expect(page.title()).toContain('New Task');
    await expect(page.locator('h1.page-title')).toContainText('New Task');
    await page.locator('#myTab div[role="tablist"] button[aria-controls="advanced"]').click();
    await expect(page.locator('#task-form').filter({
      hasText: 'Notification'
    })).toBeVisible();
  });
  test('can notify successful task execution', async ({
    page,
    joomla
  }) => {
    const task = await joomla.db_createSchedulerTask({
      title: 'Test task',
      type: 'delete.actionlogs',
      execution_rules: {
        'rule-type': 'manual'
      },
      cron_rules: {
        type: 'manual',
        exp: ''
      },
      params: {
        notifications: {
          success_mail: 1
        },
        logDeletePeriod: 7
      }
    });
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks&filter=');
    await joomla.searchForItem('Test task');
    await expect(page.locator('button[data-scheduler-run]')).toHaveAttribute('data-id', task.id).click();
    const interception = await page.waitForResponse(resp => /GET/.test(resp.url()));
    expect(interception.response.body.message).toBe(null);
    expect(interception.response.body.success).toBe(true);
    await expect(page.locator('joomla-dialog[type="inline"]')).toBeVisible();
    await expect(page.locator('joomla-dialog[type="inline"]')).toBeVisible();
    const mails = await joomla.getMails();
    await expect(mails).toHaveLength(1);
    await expect(mails[0].body).toContain(`Scheduled Task#${task.id}, Test task, has been successfully executed`);
    await expect(mails[0].headers.subject).toContain('Task Successful');
    await expect(mails[0].headers.from).toBe(`"${joomla.expose.sitename}" <${joomla.expose.email}>`);
    await expect(mails[0].headers.to).toBe(joomla.expose.email);
  });
  test('can notify failed task execution', async ({
    page,
    joomla
  }) => {
    const task = await joomla.db_createSchedulerTask({
      title: 'Test task',
      type: 'plg_task_requests_task_get',
      execution_rules: {
        'rule-type': 'manual'
      },
      cron_rules: {
        type: 'manual',
        exp: ''
      },
      params: {
        notifications: {
          failure_mail: 1
        },
        url: `${Cypress.config('baseUrl').replace('https://', 'http://')}/invalid.html`,
        timeout: 120
      }
    });
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks&filter=');
    await joomla.searchForItem('Test task');
    await expect(page.locator('button[data-scheduler-run]')).toHaveAttribute('data-id', task.id).click();
    const interception = await page.waitForResponse(resp => /GET/.test(resp.url()));
    expect(interception.response.body.message).toBe(null);
    expect(interception.response.body.success).toBe(true);
    await expect(page.locator('joomla-dialog[type="inline"]')).toBeVisible();
    await expect(page.locator('joomla-dialog[type="inline"]')).toBeVisible();
    const mails = await joomla.getMails();
    await expect(mails).toHaveLength(1);
    await expect(mails[0].body).toContain(`Scheduled Task#${task.id}, Test task, has failed with exit code 5`);
    await expect(mails[0].attachments).toHaveLength(1);
    await expect(mails[0].headers.subject).toContain('Task Failure');
    await expect(mails[0].headers.from).toBe(`"${joomla.expose.sitename}" <${joomla.expose.email}>`);
    await expect(mails[0].headers.to).toBe(joomla.expose.email);
  });
});
