// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that the multi authentication plugin', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('INSERT INTO #__mail_templates (template_id, extension, language, subject, body, htmlbody, attachments, params) VALUES (\'plg_multifactorauth_email.mail\', \'plg_multifactorauth_email\', \'\', \'PLG_MULTIFACTORAUTH_EMAIL_EMAIL_SUBJECT\', \'PLG_MULTIFACTORAUTH_EMAIL_EMAIL_BODY\', \'\', \'\', \'{"tags":["code","sitename","siteurl","username","email","fullname"]}\')');
  });
  test('can send mail with mailer factory', async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__mail_templates WHERE template_id = \'plg_multifactorauth_email.mail\'');
    await joomla.doFrontendLogin();
    await page.goto('/index.php?option=com_users&view=profile&layout=edit');
    await joomla.clearEmails();
    await page.locator('.com-users-methods-list-method-name-email a.com-users-methods-list-method-addnew').click();
    const mails = await joomla.getMails();
    await expect(mails).toHaveLength(1);
    await expect(mails[0].headers.subject).toMatch(/code is -\d{6}-$/);
    const code = /code is -(\d{6})-$/.exec(mails[0].headers.subject)[1];
    await expect(mails[0].html).toBe(false);
  });
});
