// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the login module', () => {
  test('can log in and out with the default credentials', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin(null, null, false);
    await joomla.doFrontendLogout();
  });
  test('can log in with a test user', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user',
      username: 'test',
      email: 'test@example.com',
      password: '098f6bcd4621d373cade4e832627b4f6'
    });
    await page.goto('/');
    await page.locator('#modlgn-username-16').fill('test');
    await page.locator('#modlgn-passwd-16').fill('test');
    await page.locator('input[name="remember"]').check();
    await page.locator('button[name="Submit"]').click();
    await expect(page.locator('.mod-login-logout')).toContainText('Hi automated test user');
  });
});
