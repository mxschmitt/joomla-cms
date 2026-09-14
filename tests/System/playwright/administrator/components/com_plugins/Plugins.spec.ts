// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the plugins list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_plugins&view=plugins');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Plugins');
  });
  test('can display a list of plugins', async ({
    page,
    joomla
  }) => {
    await expect(page.getByText('Action Log - Joomla').first()).toBeVisible();
  });
  test('can unpublish a plugin', async ({
    page,
    joomla
  }) => {
    await joomla.searchForItem('Action Log - Joomla');
    await joomla.checkAllResults();
    await page.getByText('Disable').first().click();
    await joomla.checkForSystemMessage('Plugin disabled.');
  });
  test('can publish a plugin', async ({
    page,
    joomla
  }) => {
    await joomla.searchForItem('Action Log - Joomla');
    await joomla.checkAllResults();
    await page.getByText('Enable').first().click();
    await joomla.checkForSystemMessage('Plugin enabled.');
  });
  test('can edit a plugin', async ({
    page,
    joomla
  }) => {
    await joomla.searchForItem('Action Log - Joomla');
    await page.locator('a').filter({
      hasText: 'Action Log - Joomla'
    }).click();
    await expect(page.getByText('Plugins: Action Log - Joomla').first()).toBeVisible();
    await page.getByText('Close').first().click();
  });
});
