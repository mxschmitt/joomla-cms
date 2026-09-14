// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';
import { TOTP } from 'totp-generator';

test.describe('Test in backend that the user', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    const uid = await joomla.db_getUserId();
    await joomla.queryDB(`DELETE FROM #__user_mfa WHERE user_id = ${uid}`);
  });
  test('can login with Multi-factor Authentication (email)', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await joomla.clearEmails();
    await page.locator('.com-users-methods-list-method-name-email a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Code');
    let mails = await joomla.getMails();
    await expect(mails).toHaveLength(1);
    await expect(mails[0].headers.subject).toMatch(/code is -\d{6}-$/);
    let code = /code is -(\d{6})-$/.exec(mails[0].headers.subject)[1];
    await expect(mails[0].html).toBe(false);
    code = code;
    await page.locator('#com-users-method-code').fill(code);
    await page.locator('#com-users-method-edit').evaluate(form => form.submit());
    await expect(page.locator('.com-users-methods-list-method-name-email .com-users-methods-list-method-record').filter({
      hasText: 'Test Code'
    })).toBeVisible();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate(form => form.submit());
    await expect(page.locator('#users-mfa-title').filter({
      hasText: 'Test Code'
    })).toBeVisible();
    mails = await joomla.getMails();
    await expect(mails).toHaveLength(2);
    await expect(mails[1].headers.subject).toMatch(/code is -\d{6}-$/);
    code = /code is -(\d{6})-$/.exec(mails[1].headers.subject)[1];
    code = code;
    await page.locator('#users-mfa-code').fill(code);
    await page.locator('#users-mfa-captive-form').evaluate(form => form.submit());
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'is enabled'
    })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-email a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'not enabled'
    })).toBeVisible();
  });
  test('can login with Multi-factor Authentication (totp)', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Code');
    const key = await page.locator('.com-users-method-edit-tabular-container table tr td').filter({
      hasText: 'Enter this key'
    }).textContent();
    key.trim();
    let secret = secret;
    await page.locator('#com-users-method-code').fill(TOTP.generate(secret).otp);
    await page.locator('#com-users-method-edit').evaluate(form => form.submit());
    await expect(page.locator('.com-users-methods-list-method-name-totp .com-users-methods-list-method-record').filter({
      hasText: 'Test Code'
    })).toBeVisible();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate(form => form.submit());
    await expect(page.locator('#users-mfa-title').filter({
      hasText: 'Verification code'
    })).toBeVisible();
    secret = secret;
    await page.locator('#users-mfa-code').fill(TOTP.generate(secret).otp);
    await page.locator('#users-mfa-captive-form').evaluate(form => form.submit());
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'is enabled'
    })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'not enabled'
    })).toBeVisible();
  });
  test('can login with Multi-factor Authentication (passkey)', {
    tag: "@chromium-only"
  }, async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await page.locator('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Passkey');
    await page.locator('#toolbar-user-mfa-edit-save').click();
    await expect(page.locator('.com-users-methods-list-method-name-webauthn .com-users-methods-list-method-record').filter({
      hasText: 'Test Passkey'
    })).toBeVisible();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate(form => form.submit());
    await expect(page.locator('#users-mfa-title').filter({
      hasText: 'Passkey'
    })).toBeVisible();
    await page.locator('#toolbar-user-mfa-submit').click();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'is enabled'
    })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'not enabled'
    })).toBeVisible();
    await joomla.disableWebAuthn();
  });
  test('can login with Multi-factor Authentication (backup codes)', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-addnew').click();
    await page.locator('#com-users-method-edit-title').fill('Test Code');
    const key = await page.locator('.com-users-method-edit-tabular-container table tr td').filter({
      hasText: 'Enter this key'
    }).textContent();
    key.trim();
    const secret = secret;
    await page.locator('#com-users-method-code').fill(TOTP.generate(secret).otp);
    await page.locator('#com-users-method-edit').evaluate(form => form.submit());
    await expect(page.locator('.com-users-methods-list-method-name-totp .com-users-methods-list-method-record').filter({
      hasText: 'Test Code'
    })).toBeVisible();
    await expect(page.locator('.com-users-methods-list-method-name-backupcodes .com-users-methods-list-method-record-info a')).toHaveText('Print these codes').click();
    let code = await page.locator('table > tbody > tr > td').first().textContent();
    code = /\d{8}/.exec(code)[0];
    await page.locator('#toolbar-user-mfa-edit-cancel').filter({
      hasText: 'Back'
    }).click();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#form-login').evaluate(form => form.submit());
    await expect(page.locator('#users-mfa-title').filter({
      hasText: 'Verification code'
    })).toBeVisible();
    await page.locator('#toolbar-user-mfa-choose-another').click();
    await page.locator('a.com-users-method').filter({
      hasText: 'Backup Codes'
    }).click();
    await expect(page.locator('#users-mfa-title').filter({
      hasText: 'Backup Codes'
    })).toBeVisible();
    code = code;
    await page.locator('#users-mfa-code').fill(code);
    await page.locator('#users-mfa-captive-form').evaluate(form => form.submit());
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'is enabled'
    })).toBeVisible();
    await page.locator('.com-users-methods-list-method-name-totp a.com-users-methods-list-method-record-delete').click();
    await expect(page.locator('#com-users-methods-reset-message').filter({
      hasText: 'not enabled'
    })).toBeVisible();
  });
});
