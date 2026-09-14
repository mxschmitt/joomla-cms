// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the user form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__users WHERE username = 'test'");
  });
  test('can create a new user', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&task=user.add');
    await page.locator('#jform_name').fill("").fill('test user');
    await page.locator('#jform_username').fill("").fill('test');
    await page.locator('#jform_email').fill("").fill('test@example.com');
    await page.locator('#jform_password').fill("").fill('testtesttest');
    await page.locator('#jform_password2').fill("").fill('testtesttest');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('User saved');
    await expect(page.getByText('test user').first()).toBeVisible();
  });
  test('can edit a user', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createUser();
    await page.goto(`/administrator/index.php?option=com_users&task=user.edit&id=${id}`);
    await page.locator('#jform_name').fill("").fill('test edited');
    await page.locator('#jform_username').fill("").fill('testedited');
    await page.locator('#jform_password').fill("").fill('testeditedtest');
    await page.locator('#jform_password2').fill("").fill('testeditedtest');
    await page.locator('#jform_email').fill("").fill('testedited@example.com');
    await joomla.clickToolbarButton('Save');
    await joomla.checkForSystemMessage('User saved.');
  });
  test('can reset password for a user', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user',
      username: 'test',
      email: 'test@example.com',
      password: '098f6bcd4621d373cade4e832627b4f6',
      group_id: 8,
      requireReset: 1
    });
    await page.goto('/administrator/index.php?option=com_users');
    await expect(page.getByText('Password Reset Required').first()).toBeVisible();
    await joomla.doAdministratorLogout();
    await page.goto('administrator/index.php');
    await page.locator('#mod-login-username').fill('test');
    await page.locator('#mod-login-password').fill('test');
    await page.locator('#btn-login-submit').click();
    await expect(page.getByText('You are required to reset your password before proceeding.').first()).toBeVisible();
    await page.locator('#jform_password').fill("").fill('testresetpswd');
    await page.locator('#jform_password2').fill("").fill('testresetpswd');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('User saved.');
    await joomla.doAdministratorLogout();
    await page.goto('administrator/index.php');
    await page.locator('#mod-login-username').fill('test');
    await page.locator('#mod-login-password').fill('testresetpswd');
    await page.locator('#btn-login-submit').click();
    await page.goto('/administrator/index.php?option=com_users');
    await expect(page.getByText('Password Reset Required').first()).toHaveCount(0);
  });
});
