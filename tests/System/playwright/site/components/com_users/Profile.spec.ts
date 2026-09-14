// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users profile view', () => {
  test('can display a user profile for a test user without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user',
      username: 'automatedtestuser',
      password: '098f6bcd4621d373cade4e832627b4f6',
      registerDate: '2023-03-01 20:00:00'
    });
    await joomla.doFrontendLogin('automatedtestuser', 'test', false);
    await page.goto('/index.php?option=com_users&view=profile');
    await expect(page.locator('#users-profile-core')).toContainText('Profile');
    await expect(page.locator('#users-profile-core')).toContainText('Name');
    await expect(page.locator('#users-profile-core')).toContainText('automated test user');
    await expect(page.locator('#users-profile-core')).toContainText('Username');
    await expect(page.locator('#users-profile-core')).toContainText('automatedtestuser');
    await expect(page.locator('#users-profile-core')).toContainText('Registered Date');
    await expect(page.locator('#users-profile-core')).toContainText('Wednesday, 01 March 2023');
  });
  test('can display a user profile for a test user in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user',
      username: 'automatedtestuser',
      password: '098f6bcd4621d373cade4e832627b4f6',
      registerDate: '2023-03-01 20:00:00'
    });
    await joomla.db_createMenuItem({
      title: 'Automated test user profile',
      link: 'index.php?option=com_users&view=profile'
    });
    await joomla.doFrontendLogin('automatedtestuser', 'test', false);
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated test user profile' }).click();
    await expect(page.locator('#users-profile-core')).toContainText('Profile');
    await expect(page.locator('#users-profile-core')).toContainText('Name');
    await expect(page.locator('#users-profile-core')).toContainText('automated test user');
    await expect(page.locator('#users-profile-core')).toContainText('Username');
    await expect(page.locator('#users-profile-core')).toContainText('automatedtestuser');
    await expect(page.locator('#users-profile-core')).toContainText('Registered Date');
    await expect(page.locator('#users-profile-core')).toContainText('Wednesday, 01 March 2023');
  });
});
