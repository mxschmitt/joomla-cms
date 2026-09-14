// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the webauthn system plugin', { tag: '@chromium-only' }, () => {
  test.beforeEach(async ({ joomla }) => {
    await joomla.enableWebAuthn();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.disableWebAuthn();
    await joomla.db_updateExtensionParameter('attestationSupport', '0', 'plg_system_webauthn');
  });
  test('can use passkeys in frontend', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php?option=com_users&view=profile');
    await expect(page.locator('#users-profile-custom-webauthn').filter({
      hasText: 'Passkey Login'
    })).toBeVisible();
    await page.locator('.com-users-profile__edit.btn-toolbar').filter({
      hasText: 'Edit Profile'
    }).click();
    await page.locator('#plg_system_webauthn-manage-add').click();
    await expect(page.locator('#plg_system_webauthn-management-interface table tbody tr').filter({
      hasText: 'Generic Passkey'
    })).toBeVisible();
    await page.locator('.plg_system_webauthn-manage-edit').filter({
      hasText: 'Edit Name'
    }).click();
    await page.locator('.webauthnManagementEditorRow input').fill('Test Passkey');
    await page.locator('.webauthnManagementEditorRow button').filter({
      hasText: 'Save'
    }).click();
    await joomla.doFrontendLogout();
    await joomla.db_updateExtensionParameter('attestationSupport', '1', 'plg_system_webauthn');
    await page.goto('index.php?option=com_users&view=login');
    await page.locator('form.mod-login input[name="username"]').fill(joomla.expose.username);
    await page.locator('.mod-login .plg_system_webauthn_login_button').filter({
      hasText: 'Sign in with a passkey'
    }).click();
    await expect(page.locator('.mod-login-logout button[type=submit]')).toBeVisible();
    await expect(page.locator('.mod-login-logout button[type=submit]')).toContainText('Log out');
    await page.goto('/index.php?option=com_users&view=profile');
    await page.locator('.com-users-profile__edit.btn-toolbar').filter({
      hasText: 'Edit Profile'
    }).click();
    await expect(page.locator('#plg_system_webauthn-management-interface table img')).toBeVisible();
    await page.locator('.plg_system_webauthn-manage-delete').filter({
      hasText: 'Remove'
    }).click();
    await expect(page.locator('.plg_system_webauthn-manage-delete')).toHaveCount(0);
  });
  test('can use passkeys in backend', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin(null, null, false);
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="attrib-webauthn"]').filter({
      hasText: 'Passkey Login'
    }).click();
    await page.locator('#plg_system_webauthn-manage-add').click();
    await expect(page.locator('#plg_system_webauthn-management-interface table tbody tr').filter({
      hasText: 'Generic Passkey'
    })).toBeVisible();
    await page.locator('.plg_system_webauthn-manage-edit').filter({
      hasText: 'Edit Name'
    }).click();
    await page.locator('.webauthnManagementEditorRow input').fill('Test Passkey');
    await page.locator('.webauthnManagementEditorRow button').filter({
      hasText: 'Save'
    }).click();
    await joomla.clickToolbarButton('Cancel');
    await joomla.doAdministratorLogout();
    await joomla.db_updateExtensionParameter('attestationSupport', '1', 'plg_system_webauthn');
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#form-login .plg_system_webauthn_login_button').filter({
      hasText: 'Sign in with a passkey'
    }).click();
    await expect(page.locator('h1.page-title')).toContainText('Home Dashboard');
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await page.locator('.header-profile:visible').click();
    await page.locator('.header-profile a.dropdown-item').filter({
      hasText: 'Edit Account'
    }).click();
    await page.locator('#myTab div[role="tablist"] button[aria-controls="attrib-webauthn"]').filter({
      hasText: 'Passkey Login'
    }).click();
    await expect(page.locator('#plg_system_webauthn-management-interface table img')).toBeVisible();
    await page.locator('.plg_system_webauthn-manage-delete').filter({
      hasText: 'Remove'
    }).click();
    await expect(page.locator('.plg_system_webauthn-manage-delete')).toHaveCount(0);
  });
  test('can delete passkeys when the user is deleted', async ({
    page,
    joomla
  }) => {
    let webauthnCredentials;
    await joomla.db_createUser({
      name: 'test user',
      email: 'test@example.com'
    });
    await joomla.doFrontendLogin('test', 'test', null);
    await page.goto('/index.php?option=com_users&view=profile');
    await expect(page.locator('#users-profile-custom-webauthn').filter({
      hasText: 'Passkey Login'
    })).toBeVisible();
    await page.locator('.com-users-profile__edit.btn-toolbar').filter({
      hasText: 'Edit Profile'
    }).click();
    await page.locator('#plg_system_webauthn-manage-add').click();
    await expect(page.locator('#plg_system_webauthn-management-interface table tbody tr').filter({
      hasText: 'Generic Passkey'
    })).toBeVisible();
    let data = await joomla.queryDB('SELECT * FROM #__webauthn_credentials');
    webauthnCredentials = data.length;
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_users&view=users');
    await joomla.searchForItem('test user');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Delete').first().click();
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('User deleted.');
    data = await joomla.queryDB('SELECT * FROM #__webauthn_credentials');
    expect(data.length).toBe(webauthnCredentials - 1);
  });
});
