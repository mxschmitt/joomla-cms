// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the config templates view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
  });
  test('can edit template settings without menu item', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_config&view=templates');
    await expect(page.title()).toBe('Home');
    await page.locator('#params_siteDescription').fill('test site description');
    await page.locator('#templates-form button[data-submit-task="templates.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    await expect(page.locator('header div.site-description')).toContainText('test site description');
    await expect(page.locator('#params_siteDescription')).toBeVisible();
    await page.locator('#templates-form button[data-submit-task="templates.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    await expect(page.locator('header div.site-description')).toHaveCount(0);
  });
  test('can edit template settings with menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test template settings',
      link: 'index.php?option=com_config&view=templates'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test template settings'}).click();
    await expect(page.title()).toBe('automated test template settings');
    await page.locator('#params_brand0').click();
    await page.locator('#templates-form button[data-submit-task="templates.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    await expect(page.locator('header div.navbar-brand')).toHaveCount(0);
    await page.locator('#params_brand1').click();
    await page.locator('#templates-form button[data-submit-task="templates.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    await expect(page.locator('header div.navbar-brand')).toBeVisible();
  });
});
