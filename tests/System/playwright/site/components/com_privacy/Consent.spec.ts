// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the privacy consent view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('allowUserRegistration', '1', 'com_users');
    await joomla.db_enableExtension('1', 'plg_system_privacyconsent');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('allowUserRegistration', '0', 'com_users');
    await joomla.db_enableExtension('0', 'plg_system_privacyconsent');
    await joomla.queryDB('DELETE FROM #__privacy_consents');
    await joomla.queryDB("DELETE FROM #__users WHERE username = 'test'");
  });
  test('can display privacy policy checkbox to users already with an account', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php');
    await joomla.db_createPrivacyConsent();
    await expect(page.locator('.alert').filter({
      hasText: 'By signing up to this website and agreeing to the Privacy Policy you agree to this website storing your information.'
    })).toBeVisible();
  });
  test('can allow users already with an account to not agree to the privacy policy', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php');
    await page.locator('.controls > .btn-primary').click({
      force: true
    });
    await expect(page.locator('.alert-message')).toBeTruthy();
  });
  test('can allow users already with an account to agree to the privacy policy', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php');
    await page.locator('#jform_privacyconsent_privacy0').click();
    await page.locator('.controls > .btn-primary').click({
      force: true
    });
    await expect(page.locator('.alert-message')).toBeTruthy();
  });
  test('can allow current users who declined privacy request to edit then agree to privacy consent', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php');
    await page.locator('#jform_privacyconsent_privacy1').click();
    await page.locator('.controls > .btn-primary').click({
      force: true
    });
    await expect(page.locator('.alert-message')).toBeTruthy();
    await page.locator('#jform_privacyconsent_privacy0').click();
    await page.locator('.controls > .btn-primary').click({
      force: true
    });
    await expect(page.locator('.alert-message')).toBeTruthy();
  });
  test('can display privacy consent on new user registration form', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_users&view=registration');
    await expect(page.locator('.alert')).toContainText('By signing up to this website and agreeing to the Privacy Policy you agree to this website storing your information.');
  });
  test('can display privacy consent on new user registration form and have user decline privacy consent', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_users&view=registration');
    await page.locator('#jform_name').fill('test user');
    await page.locator('#jform_username').fill('test');
    await page.locator('#jform_email1').fill('test@example.com');
    await page.locator('#jform_password1').fill('testtesttest');
    await page.locator('#jform_password2').fill('testtesttest');
    await page.locator('.com-users-registration__register').click();
    await expect(page.locator('.alert-message')).toContainText("Registration failed: Agreement to the site's Privacy Policy is required.");
  });
  test('can display privacy consent on new user registration form and have user accept privacy consent', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_users&view=registration');
    await page.locator('#jform_name').fill('test user');
    await page.locator('#jform_username').fill('test');
    await page.locator('#jform_email1').fill('test@example.com');
    await page.locator('#jform_password1').fill('testtesttest');
    await page.locator('#jform_password2').fill('testtesttest');
    await page.locator('#jform_privacyconsent_privacy0').click();
    await page.locator('.com-users-registration__register').click();
    await expect(page.locator('.alert-message')).toContainText('Your account has been created and a verification link has been sent to the email address you entered. Note that you must verify the account by selecting the verification link when you get the email and then an administrator will activate your account before you can login.');
  });
});
