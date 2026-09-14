// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users login view', () => {
  test('can log in a test user without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      username: 'test',
      password: '098f6bcd4621d373cade4e832627b4f6'
    });
    await page.goto('/index.php?option=com_users&view=login');
    await page.locator('#username').fill('test');
    await page.locator('#password').fill('test');
    await page.locator('#remember').check();
    await page.locator('.controls > button[type="submit"].btn').click();
    await page.goto('/index.php?option=com_users&view=login');
    await expect(page.locator('.com-users-logout')).toContainText('Log out');
  });
  test('can log in a test user in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      username: 'test',
      password: '098f6bcd4621d373cade4e832627b4f6'
    });
    await joomla.db_createMenuItem({
      title: 'Automated test login',
      link: 'index.php?option=com_users&view=login'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated test login' }).click();
    await page.locator('#username').fill('test');
    await page.locator('#password').fill('test');
    await page.locator('#remember').check();
    await page.locator('.controls > button[type="submit"].btn').click();
    await page.locator('a').filter({ hasText: 'Automated test login' }).click();
    await expect(page.locator('.com-users-logout')).toContainText('Log out');
  });
});
