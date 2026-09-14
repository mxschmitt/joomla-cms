// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users registration view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('allowUserRegistration', '1', 'com_users');
    await joomla.clearEmails();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('allowUserRegistration', '0', 'com_users');
    await joomla.queryDB("DELETE FROM #__user_usergroup_map WHERE user_id = (SELECT id FROM #__users WHERE username = 'testuser')");
    await joomla.queryDB("DELETE FROM #__users WHERE username = 'testuser'");
  });
  test('can display a registration form for a test user without a menu item', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_users&view=registration');
    await expect(page.locator('.com-users-registration__form')).toContainText('User Registration');
    await page.locator('#jform_name').fill("").fill('test user');
    await page.locator('#jform_username').fill("").fill('testuser');
    await page.locator('#jform_password1').fill("").fill(`${joomla.expose.password}-test`);
    await page.locator('#jform_password2').fill("").fill(`${joomla.expose.password}-test`);
    await page.locator('#jform_email1').fill("").fill('testuser@example.com');
    await page.locator('#member-registration').evaluate(form => form.submit());
    await joomla.checkForSystemMessage('Your account has been created and a verification link has been sent to the email address you entered.');
    let mails = await joomla.getMails();
    await expect(mails).toHaveLength(1);
    await expect(mails[0].headers.subject).toContain(`Account Details for test user at ${joomla.expose.sitename}`);
    await expect(mails[0].headers.to).toBe('testuser@example.com');
    await expect(mails[0].body).toContain(`Hello test user,\n\nThank you for registering at ${joomla.expose.sitename}.`);
    await expect(mails[0].body).toMatch(/http\S+\?task=registration\.activate&token=[a-z0-9]+/);
    const activatelink = /http\S+\?task=registration\.activate&token=[a-z0-9]+/.exec(mails[0].body)[0];
    await expect(mails[0].html).toBe(false);
    let url = activatelink;
    await page.goto(url);
    await joomla.checkForSystemMessage('Your email address has been verified.');
    mails = await joomla.getMails();
    await expect(mails).toHaveLength(2);
    await expect(mails[1].headers.subject).toContain(`Registration approval required for account of test user at ${joomla.expose.sitename}`);
    await expect(mails[1].headers.to).toBe(joomla.expose.email);
    await expect(mails[1].body).toContain(`Hello administrator,\n\nA new user has registered at ${joomla.expose.sitename}.`);
    await expect(mails[1].body).toContain('Name :  test user');
    await expect(mails[1].body).toContain('email:  testuser@example.com');
    await expect(mails[1].body).toContain('Username:  testuser');
    await expect(mails[1].body).toMatch(/http\S+\?task=registration\.activate&token=[a-z0-9]+/);
    const activatelinkadmin = /http\S+\?task=registration\.activate&token=[a-z0-9]+/.exec(mails[1].body)[0];
    await expect(mails[1].html).toBe(false);
    url = activatelinkadmin;
    await page.goto(url);
    await joomla.checkForSystemMessage('Please log in to confirm that you are authorised to activate new accounts.');
    await joomla.doFrontendLogin();
    url = activatelinkadmin;
    await page.goto(url);
    await joomla.checkForSystemMessage('The user\'s account has been activated and the user has been notified about it.');
    await joomla.doFrontendLogout();
    mails = await joomla.getMails();
    await expect(mails).toHaveLength(3);
    await expect(mails[2].headers.subject).toContain(`Account activated for test user at ${joomla.expose.sitename}`);
    await expect(mails[2].headers.to).toBe('testuser@example.com');
    await expect(mails[2].body).toContain('Hello test user,\n\nYour account has been activated by an administrator.');
    await expect(mails[2].html).toBe(false);
    await joomla.doFrontendLogin('testuser', `${joomla.expose.password}-test`);
    await joomla.doFrontendLogout();
  });
  test('can display a registration form for a test user in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Automated test registration',
      link: 'index.php?option=com_users&view=registration'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated test registration' }).click();
    await expect(page.locator('.com-users-registration__form')).toContainText('User Registration');
  });
});
