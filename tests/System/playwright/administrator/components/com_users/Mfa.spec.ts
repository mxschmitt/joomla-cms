import { test, expect } from '../../../../joomla-playwright/src/fixtures';
import { TOTP } from 'totp-generator';

async function totpSecret(page: import('@playwright/test').Page): Promise<string> {
  const secret = await page
    .locator('.com-users-method-edit-tabular-container table tr td')
    .filter({ hasText: 'Enter this key' })
    .locator('xpath=following-sibling::*[1]')
    .textContent();
  return (secret || '').trim();
}

test.describe('Test in backend that the user', () => {
  test.afterEach(async ({ joomla }) => {
    const uid = await joomla.db_getUserId();
    await joomla.queryDB(`DELETE FROM #__user_mfa WHERE user_id = ${uid}`);
  });

  test('can login with Multi-factor Authentication (email)', async ({ page, joomla }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await joomla.clearEmails();
    await page.locator('.com-users-methods-list-method-name-email a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Code');
    const setupMails = await joomla.getMails();
    expect(setupMails).toHaveLength(1);
    expect(setupMails[0].headers?.subject).toMatch(/code is -\d{6}-$/);
    const setupCode = /code is -(\d{6})-$/.exec(setupMails[0].headers?.subject || '')?.[1] as string;
    expect(setupMails[0].body).toContain(`Your authentication code is ${setupCode}.`);
    expect(setupMails[0].html).toBe(false);
    await page.locator('#com-users-method-code').fill(setupCode);
    await page.locator('#com-users-method-edit').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('.com-users-methods-list-method-name-email .com-users-methods-list-method-record').filter({ hasText: 'Test Code' })).toBeVisible();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('#users-mfa-title').filter({ hasText: 'Test Code' })).toBeVisible();
    const loginMails = await joomla.getMails();
    expect(loginMails).toHaveLength(2);
    expect(loginMails[1].headers?.subject).toMatch(/code is -\d{6}-$/);
    const loginCode = /code is -(\d{6})-$/.exec(loginMails[1].headers?.subject || '')?.[1] as string;
    await page.locator('#users-mfa-code').fill(loginCode);
    await page.locator('#users-mfa-captive-form').evaluate((form: HTMLFormElement) => form.submit());
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'is enabled' })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-email a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'not enabled' })).toBeVisible();
  });

  test('can login with Multi-factor Authentication (totp)', async ({ page, joomla }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Code');
    const secret = await totpSecret(page);
    await page.locator('#com-users-method-code').fill(TOTP.generate(secret).otp);
    await page.locator('#com-users-method-edit').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('.com-users-methods-list-method-name-totp .com-users-methods-list-method-record').filter({ hasText: 'Test Code' })).toBeVisible();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('#users-mfa-title').filter({ hasText: 'Verification code' })).toBeVisible();
    await page.locator('#users-mfa-code').fill(TOTP.generate(secret).otp);
    await page.locator('#users-mfa-captive-form').evaluate((form: HTMLFormElement) => form.submit());
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'is enabled' })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'not enabled' })).toBeVisible();
  });

  test('can login with Multi-factor Authentication (passkey)', { tag: '@chromium-only' }, async ({ page, joomla }) => {
    await joomla.enableWebAuthn();
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await page.locator('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Passkey');
    await page.locator('#toolbar-user-mfa-edit-save').click();
    await expect(page.locator('.com-users-methods-list-method-name-webauthn .com-users-methods-list-method-record').filter({ hasText: 'Test Passkey' })).toBeVisible();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('#users-mfa-title').filter({ hasText: 'Passkey' })).toBeVisible();
    await page.locator('#toolbar-user-mfa-submit').click();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'is enabled' })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'not enabled' })).toBeVisible();
    await joomla.disableWebAuthn();
  });

  test('can login with Multi-factor Authentication (backup codes)', async ({ page, joomla }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Code');
    const secret = await totpSecret(page);
    await page.locator('#com-users-method-code').fill(TOTP.generate(secret).otp);
    await page.locator('#com-users-method-edit').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('.com-users-methods-list-method-name-totp .com-users-methods-list-method-record').filter({ hasText: 'Test Code' })).toBeVisible();
    const printCodes = page.locator('.com-users-methods-list-method-name-backupcodes .com-users-methods-list-method-record-info a');
    await expect(printCodes).toHaveText('Print these codes');
    await printCodes.click();
    const rawCode = await page.locator('table > tbody > tr > td').first().textContent();
    const code = /\d{8}/.exec(rawCode || '')?.[0] as string;
    await page.locator('#toolbar-user-mfa-edit-cancel').filter({ hasText: 'Back' }).click();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate((form: HTMLFormElement) => form.submit());
    await expect(page.locator('#users-mfa-title').filter({ hasText: 'Verification code' })).toBeVisible();
    await page.locator('#toolbar-user-mfa-choose-another').click();
    await page.locator('a.com-users-method').filter({ hasText: 'Backup Codes' }).click();
    await expect(page.locator('#users-mfa-title').filter({ hasText: 'Backup Codes' })).toBeVisible();
    await page.locator('#users-mfa-code').fill(code);
    await page.locator('#users-mfa-captive-form').evaluate((form: HTMLFormElement) => form.submit());
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.openAdministratorAccount();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'is enabled' })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({ hasText: 'not enabled' })).toBeVisible();
  });
});
