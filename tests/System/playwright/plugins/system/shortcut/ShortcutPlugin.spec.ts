import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the shortcut system plugin', () => {
  test.beforeEach(async ({ joomla }) => {
    await joomla.doAdministratorLogin();
  });

  test.afterEach(async ({ joomla }) => {
    await joomla.queryDB("DELETE FROM #__banners WHERE name = 'Test banner'");
    await joomla.queryDB("DELETE FROM #__contact_details WHERE name = 'Test contact'");
  });

  test('can save (apply) edit form', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_banners&task=banner.add');
    await page.locator('#jform_name').fill('Test banner');
    await page.locator('#jform_name').blur();
    await page.locator('body').pressSequentially('JA');
    await joomla.checkForSystemMessage('Banner saved.');
    await expect(page.locator('#jform_name')).toHaveValue('Test banner');
  });

  test('can save and close edit form', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_contact&task=contact.add');
    await page.locator('#jform_name').fill('Test contact');
    await page.locator('#jform_name').blur();
    await page.locator('body').pressSequentially('JS');
    await joomla.checkForSystemMessage('Contact saved.');
    await expect(page.locator('#contactList').getByText('Test contact').first()).toBeVisible();
  });

  test('can cancel edit form', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article');
    await page.locator('#jform_title').blur();
    const listView = page.waitForResponse((resp) => /index\.php\?option=com_content&view=articles/.test(resp.url()));
    await page.locator('body').pressSequentially('JQ');
    await listView;
  });

  test('can open edit form', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_menus&view=menus');
    await page.locator('body').pressSequentially('JN');
    await expect(page.locator('h1.page-title')).toContainText('Menus: Add');
  });

  test('can search in list view', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_plugins&view=plugins&filter=');
    await page.locator('body').pressSequentially('JF');
    await expect(page.locator(':focus')).toHaveAttribute('name', 'filter[search]');
    await page.locator(':focus').fill('Keyboard Shortcuts');
    await page.locator(':focus').press('Enter');
    await expect(page.locator('#pluginList').getByText('System - Keyboard Shortcuts').first()).toBeVisible();
  });

  test('can open component options', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_privacy');
    await page.locator('body').pressSequentially('JO');
    await expect(page.locator('h1.page-title')).toContainText('Privacy: Options');
  });

  test('can open help screen', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_users&view=users');
    const popupPromise = page.waitForEvent('popup');
    await page.locator('body').pressSequentially('JH');
    const popup = await popupPromise;
    expect(popup.url()).toMatch(/https:\/\/help\.joomla\.org\/proxy\?keyref=Help\d+:Users&lang=en/);
    await popup.close();
  });

  test('can toggle menu', async ({ page }) => {
    await page.goto('/administrator/index.php');
    await expect(page.locator('#menu-collapse').filter({ hasText: 'Toggle Menu' })).toBeVisible();
    await expect(page.locator('#wrapper')).not.toHaveClass(/closed/);
    await page.locator('body').pressSequentially('JM');
    await expect(page.locator('#wrapper')).toHaveClass(/\bclosed\b/);
    await page.locator('body').pressSequentially('JM');
    await expect(page.locator('#wrapper')).not.toHaveClass(/\bclosed\b/);
    await expect(page.locator('#menu-collapse').filter({ hasText: 'Toggle Menu' })).toBeVisible();
  });

  test('can open dashboard', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_cpanel&view=cpanel&dashboard=system');
    const dashboard = page.waitForResponse((resp) => resp.url().includes('index.php'));
    await page.locator('body').pressSequentially('JD');
    await dashboard;
    await expect(page.locator('h1.page-title')).toContainText('Home Dashboard');
  });

  test('can open shortcut overview', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_cpanel&view=cpanel&dashboard=help');
    await expect(page.locator('div.container-fluid').getByText('J then X Keyboard Shortcuts').first()).toBeVisible();
    await page.locator('body').pressSequentially('JX');
    await expect(page.locator('joomla-dialog[type="inline"] .joomla-dialog-header')).toContainText('Keyboard Shortcuts');
  });
});
