// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that users API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__users WHERE name = 'automated test user'");
  });
  test('can deliver a list of users', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user',
      username: 'automated_test_username'
    });
    const response = await joomla.api_get('/users');
    await joomla.api_responseContains(response, 'name', 'automated test user');
  });
  test('can create a user', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/users', {
      block: '0',
      email: 'test1@mail.com',
      groups: ['2'],
      id: '0',
      lastResetTime: '',
      lastvisitDate: '',
      name: 'automated test user',
      params: {
        admin_language: '',
        admin_style: '',
        editor: '',
        helpsite: '',
        language: '',
        timezone: ''
      },
      password: 'qwertyqwerty123',
      password2: 'qwertyqwerty123',
      registerDate: '',
      requireReset: '0',
      resetCount: '0',
      sendEmail: '0',
      username: 'automated_test_username'
    });
    await expect(response.body.data.attributes.name).toContain('automated test user');
  });
  test('can update a user', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createUser({
      name: 'automated test user'
    });
    const updatedUserData = {
      name: 'updated automated test user',
      groups: ['2']
    };
    await joomla.api_patch(`/users/${id}`, updatedUserData);
    const response = undefined;
    await expect(response.body.data.attributes.name).toContain('updated automated test user');
  });
  test('can delete a user', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createUser({
      name: 'automated test user'
    });
    await joomla.api_delete(`/users/${id}`);
  });
  test('can login after update a user', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createUser({
      name: 'test',
      password: '098f6bcd4621d373cade4e832627b4f6'
    });
    const updatedUserData = {
      name: 'test',
      groups: ['2']
    };
    await joomla.api_patch(`/users/${id}`, updatedUserData);
    const response = undefined;
    await expect(response.body.data.attributes.name).toContain('test');
    await page.goto('/index.php?option=com_users&view=login');
    await page.locator('#username').fill('test');
    await page.locator('#password').fill('test');
    await page.locator('#remember').check();
    await page.locator('.controls > button[type="submit"].btn').click();
    await page.goto('/index.php?option=com_users&view=login');
    await expect(page.locator('.com-users-logout')).toContainText('Log out');
  });
});
