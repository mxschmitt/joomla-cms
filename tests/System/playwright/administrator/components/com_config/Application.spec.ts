// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the application configuration', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_config');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1').filter({
      hasText: 'Global Configuration'
    })).toBeVisible();
  });
  test('can display the configuration', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('label').filter({
      hasText: 'Site Name'
    })).toBeVisible();
  });
  test('can send a test mail', async ({
    page,
    joomla
  }) => {
    await page.locator('#configTabs div[role="tablist"] button[aria-controls="page-server"]').click();
    await page.locator('#jform_mailer').selectOption({
      label: 'smtp'
    });
    await page.locator('#jform_smtphost').fill(joomla.expose.smtp_host);
    await page.locator('#jform_smtpport').fill(joomla.expose.smtp_port);
    await page.locator('#jform_smtpsecure').selectOption({
      label: 'none'
    });
    await page.locator('#sendtestmail').click();
    const mails = await joomla.getMails();
    await joomla.checkForSystemMessage('The email was sent to');
    expect(mails.length).toBe(1);
    await expect(mails[0].body).toContain('This is a test mail sent using');
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].receivers).toBeTruthy();
  });
});
