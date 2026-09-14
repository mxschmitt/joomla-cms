import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the task notification system plugin', () => {
  test.beforeEach(async ({ joomla }) => {
    await joomla.clearEmails();
    await joomla.doAdministratorLogin();
  });

  test('can display notification form', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks');
    await joomla.clickToolbarButton('New');
    await page.locator('div.new-task-details').filter({ hasText: 'Delete ActionLogs' }).click();
    expect(await page.title()).toContain('New Task');
    await expect(page.locator('h1.page-title')).toContainText('New Task');
    await page.locator('#myTab div[role="tablist"] button[aria-controls="advanced"]').click();
    await expect(page.locator('#task-form').filter({ hasText: 'Notification' })).toBeVisible();
  });

  test('can notify successful task execution', async ({ page, joomla }) => {
    const task = await joomla.db_createSchedulerTask({
      title: 'Test task',
      type: 'delete.actionlogs',
      execution_rules: { 'rule-type': 'manual' },
      cron_rules: { type: 'manual', exp: '' },
      params: {
        notifications: { success_mail: 1 },
        logDeletePeriod: 7,
      },
    });
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks&filter=');
    await joomla.searchForItem('Test task');
    const runButton = page.locator('button[data-scheduler-run]');
    await expect(runButton).toHaveAttribute('data-id', String(task.id));
    const waitForRun = page.waitForResponse((resp) => /option=com_ajax.*plugin=RunSchedulerTest/.test(resp.url()) && resp.request().method() === 'GET');
    await runButton.click();
    const interception = await waitForRun;
    const body = await interception.json();
    expect(body.message).toBe(null);
    expect(body.success).toBe(true);
    const dialog = page.locator('joomla-dialog[type="inline"]');
    await expect(dialog.locator('header.joomla-dialog-header')).toContainText(`Run Task (ID: ${task.id})`);
    await expect(dialog.locator('div.scheduler-status')).toContainText('Status: Completed');
    const mails = await joomla.getMails();
    expect(mails).toHaveLength(1);
    expect(mails[0].body).toContain(`Scheduled Task#${task.id}, Test task, has been successfully executed`);
    expect(mails[0].headers?.subject).toContain('Task Successful');
    expect(mails[0].headers?.from).toBe(`"${joomla.expose.sitename}" <${joomla.expose.email}>`);
    expect(mails[0].headers?.to).toBe(joomla.expose.email);
  });

  test('can notify failed task execution', async ({ page, joomla }) => {
    const task = await joomla.db_createSchedulerTask({
      title: 'Test task',
      type: 'plg_task_requests_task_get',
      execution_rules: { 'rule-type': 'manual' },
      cron_rules: { type: 'manual', exp: '' },
      params: {
        notifications: { failure_mail: 1 },
        url: `${joomla.config.baseURL.replace('https://', 'http://')}/invalid.html`,
        timeout: 120,
      },
    });
    await page.goto('/administrator/index.php?option=com_scheduler&view=tasks&filter=');
    await joomla.searchForItem('Test task');
    const runButton = page.locator('button[data-scheduler-run]');
    await expect(runButton).toHaveAttribute('data-id', String(task.id));
    const waitForRun = page.waitForResponse((resp) => /option=com_ajax.*plugin=RunSchedulerTest/.test(resp.url()) && resp.request().method() === 'GET');
    await runButton.click();
    const interception = await waitForRun;
    const body = await interception.json();
    expect(body.message).toBe(null);
    expect(body.success).toBe(true);
    const dialog = page.locator('joomla-dialog[type="inline"]');
    await expect(dialog.locator('header.joomla-dialog-header')).toContainText(`Run Task (ID: ${task.id})`);
    await expect(dialog.locator('div.scheduler-status')).toContainText('Status: Completed');
    const mails = await joomla.getMails();
    expect(mails).toHaveLength(1);
    expect(mails[0].body).toContain(`Scheduled Task#${task.id}, Test task, has failed with exit code 5`);
    expect(mails[0].attachments).toHaveLength(1);
    expect(mails[0].headers?.subject).toContain('Task Failure');
    expect(mails[0].headers?.from).toBe(`"${joomla.expose.sitename}" <${joomla.expose.email}>`);
    expect(mails[0].headers?.to).toBe(joomla.expose.email);
  });
});
