// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the login component', () => {
  // Clearing the sessions before the tests to ensure we arrive at the login mask
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    
  });
  // Clearing the sessions after the tests to ensure next login works
  test.afterEach(async ({
    page,
    joomla
  }) => {
    
  });
  test('can log in and out', async ({
    page,
    joomla
  }) => {
    await page.goto('administrator/index.php');
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#btn-login-submit').click();
    await expect(page.locator('h1.page-title')).toContainText('Home Dashboard');
    await page.locator('.header-item .header-profile > .dropdown-toggle').click();
    await page.locator('.header-item .header-profile a.dropdown-item:last-child').click();
    await expect(page.locator('#mod-login-username')).toBeVisible();
  });
  test('can not log in with wrong username', async ({
    page,
    joomla
  }) => {
    await page.goto('administrator/index.php');
    await page.locator('#mod-login-username').fill('invalid');
    await page.locator('#mod-login-password').fill(joomla.expose.password);
    await page.locator('#btn-login-submit').click();
    await joomla.checkForSystemMessage('Username and password do not match or you do not have an account yet.');
  });
  test('can not log in with wrong password', async ({
    page,
    joomla
  }) => {
    await page.goto('administrator/index.php');
    await page.locator('#mod-login-username').fill(joomla.expose.username);
    await page.locator('#mod-login-password').fill('invalid');
    await page.locator('#btn-login-submit').click();
    await joomla.checkForSystemMessage('Username and password do not match or you do not have an account yet.');
  });
  test('can not log in with non-existing user', async ({
    page,
    joomla
  }) => {
    await page.goto('administrator/index.php');
    await page.locator('#mod-login-username').fill('invalid');
    await page.locator('#mod-login-password').fill('invalid');
    await page.locator('#btn-login-submit').click();
    await joomla.checkForSystemMessage('Username and password do not match or you do not have an account yet.');
  });
});
