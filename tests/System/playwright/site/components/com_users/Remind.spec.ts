// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users remind view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
  });
  test('can send a reminder email for a test user without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'test user',
      email: 'test@example.com'
    });
    await page.goto('/index.php?option=com_users&view=remind');
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await joomla.checkForSystemMessage('If the email address you entered is registered on this site you will shortly receive an email with a reminder.');
    expect(mails.length).toBe(1);
    await expect(mails[0].body).toContain('A username reminder has been requested');
    await expect(mails[0].body).toContain('/component/users/login');
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].receivers).toBeTruthy();
  });
  test('can not send a reminder email for a user which is not registered', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_users&view=remind');
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await joomla.checkForSystemMessage('If the email address you entered is registered on this site you will shortly receive an email with a reminder.');
    expect(mails.length).toBe(0);
  });
});
