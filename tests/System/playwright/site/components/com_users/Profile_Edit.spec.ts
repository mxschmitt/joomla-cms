// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users profile view edit layout', () => {
  test('can display a user form without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php?option=com_users&view=profile&layout=edit');
    await expect(page.locator('#member-profile > :nth-child(1) > legend')).toContainText('Edit Your Profile');
  });
  test('can display a user form in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Automated test edit',
      link: 'index.php?option=com_users&view=profile&layout=edit'
    });
    await joomla.doFrontendLogin();
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated test edit' }).first().click();
    await expect(page.locator('#member-profile > :nth-child(1) > legend')).toContainText('Edit Your Profile');
  });
  test('can edit a test user without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user 2',
      username: 'automatedtestuser2',
      password: '098f6bcd4621d373cade4e832627b4f6'
    });
    await joomla.doFrontendLogin('automatedtestuser2', 'test', false);
    await page.goto('/index.php?option=com_users&view=profile&layout=edit');
    await page.locator('#jform_name').fill('automated test user edited');
    await page.locator('#jform_email1').fill('testedited@example.com');
    await page.locator('.controls > .btn-primary').click({
      force: true
    });
    await joomla.checkForSystemMessage('Profile saved.');
    await expect(page.locator('#users-profile-core')).toContainText('Name');
    await expect(page.locator('#users-profile-core')).toContainText('automated test user edited');
  });
  test('can edit a test user in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      name: 'automated test user',
      username: 'automatedtestuser',
      password: '098f6bcd4621d373cade4e832627b4f6'
    });
    await joomla.db_createMenuItem({
      title: 'Automated test edit test user',
      link: 'index.php?option=com_users&view=profile&layout=edit'
    });
    await joomla.doFrontendLogin('automatedtestuser', 'test', false);
    await page.goto('/');
    await page.getByRole('link', { name: 'Automated test edit test user' }).click();
    await page.locator('#jform_name').fill('automated test user edited');
    await page.locator('#jform_email1').fill('testedited@example.com');
    await expect(page.locator('.controls > .btn-primary')).toBeVisible();
    await page.locator('.controls > .btn-primary').click({
      force: true
    });
    await joomla.checkForSystemMessage('Profile saved.');
    await expect(page.locator('.profile .btn-primary')).toBeVisible();
    await page.locator('.profile .btn-primary').click({
      force: true
    });
    await expect(page.locator('#jform_name')).toHaveValue('automated test user edited');
    await expect(page.locator('#jform_email1')).toHaveValue('testedited@example.com');
  });
});
