// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users reset view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
  });
  test('can send a reset email for a test user without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      email: 'test@example.com'
    });
    await page.goto('/index.php?option=com_users&view=reset');
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await joomla.checkForSystemMessage('If the email address you entered is registered on this site you will shortly receive an email with a link to reset the password for your account.');
    expect(mails.length).toBe(1);
    await expect(mails[0].body).toContain('To reset your password, you will need to submit this verification code');
    await expect(mails[0].body).toContain('/component/users/reset');
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].receivers).toBeTruthy();
  });
  test('can send a reset email for a test user in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      email: 'test@example.com'
    });
    await joomla.db_createMenuItem({
      title: 'Automated test reset',
      alias: 'test-reset',
      path: 'test-reset',
      link: 'index.php?option=com_users&view=reset'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated test reset' }).click();
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await joomla.checkForSystemMessage('If the email address you entered is registered on this site you will shortly receive an email with a link to reset the password for your account.');
    expect(mails.length).toBe(1);
    await expect(mails[0].body).toContain('To reset your password, you will need to submit this verification code');
    await expect(mails[0].body).toContain('/test-reset');
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].receivers).toBeTruthy();
  });
  test('can not send a reset email for a user which is not registered', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_users&view=reset');
    await page.locator('#jform_email').fill('test@example.com');
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await joomla.checkForSystemMessage('If the email address you entered is registered on this site you will shortly receive an email with a link to reset the password for your account.');
    expect(mails.length).toBe(0);
  });
  test('can show the profile page when logged in', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php?option=com_users&view=reset');
    await expect(page.locator('#users-profile-core')).toContainText('Profile');
  });
});
