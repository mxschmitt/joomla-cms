// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the shortcut system plugin', () => {
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
    await joomla.queryDB("DELETE FROM #__banners WHERE name = 'Test banner'");
    await joomla.queryDB("DELETE FROM #__contact_details WHERE name = 'Test contact'");
  });
  test('can save (apply) edit form', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_banners&task=banner.add');
    await page.locator('#jform_name').fill('Test banner');
    await page.locator('#jform_name').blur();
    await page.locator('body').pressSequentially('JA');
    await joomla.checkForSystemMessage('Banner saved.');
    await expect(page.locator('#jform_name')).toHaveValue('Test banner');
  });
  test('can save and close edit form', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_contact&task=contact.add');
    await page.locator('#jform_name').fill('Test contact');
    await page.locator('#jform_name').blur();
    await page.locator('body').pressSequentially('JS');
    await joomla.checkForSystemMessage('Contact saved.');
    await expect(page.locator('#contactList').filter({
      hasText: 'Test contact'
    })).toBeVisible();
  });
  test('can cancel edit form', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article');
    await page.locator('#jform_title').blur();
    await page.locator('body').pressSequentially('JQ');
    await page.waitForResponse(resp => /index\.php\?option=com_content&view=articles/.test(resp.url()));
  });
  test('can open edit form', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_menus&view=menus');
    await page.locator('body').pressSequentially('JN');
    await expect(page.locator('h1.page-title')).toContainText('Menus: Add');
  });
  test('can search in list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_plugins&view=plugins&filter=');
    await page.locator('body').pressSequentially('JF');
    await expect(page.locator(":focus")).toHaveAttribute('name', 'filter[search]').fill("Keyboard Shortcuts");
    await expect(page.locator(":focus")).toHaveAttribute('name', 'filter[search]').press("Enter");
    await expect(page.locator('#pluginList').filter({
      hasText: 'System - Keyboard Shortcuts'
    })).toBeVisible();
  });
  test('can open component options', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_privacy');
    await page.locator('body').pressSequentially('JO');
    await expect(page.locator('h1.page-title')).toContainText('Privacy: Options');
  });
  test('can open help screen', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_users&view=users');
    const popupPromise = page.waitForEvent('popup');
    await page.locator('body').pressSequentially('JH');
    const popup = await popupPromise;
    expect(popup.url()).toMatch(/https:\/\/help\.joomla\.org\/proxy\?keyref=Help\d+:Users&lang=en/);
    await popup.close();
  });
  test('can toggle menu', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php');
    await expect(page.locator('#menu-collapse').filter({
      hasText: 'Toggle Menu'
    })).toBeVisible();
    await expect(page.locator('#wrapper')).not.toHaveClass('closed');
    await page.locator('body').pressSequentially('JM');
    await expect(page.locator('#menu-collapse').filter({
      hasText: 'Toggle Menu'
    })).toBeHidden();
    await expect(page.locator('#wrapper')).toHaveClass('closed');
    await page.locator('body').pressSequentially('JM');
    await expect(page.locator('#menu-collapse').filter({
      hasText: 'Toggle Menu'
    })).toBeVisible();
    await expect(page.locator('#wrapper')).not.toHaveClass('closed');
  });
  test('can open dashboard', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_cpanel&view=cpanel&dashboard=system');
    await page.locator('body').pressSequentially('JD');
    await page.waitForResponse(resp => /index\.php/.test(resp.url()));
    await expect(page.locator('h1.page-title')).toContainText('Home Dashboard');
  });
  test('can open shortcut overview', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_cpanel&view=cpanel&dashboard=help');
    await expect(page.locator('div.container-fluid').filter({
      hasText: 'J then X Keyboard Shortcuts'
    })).toBeVisible();
    await page.locator('body').pressSequentially('JX');
    await expect(page.locator('joomla-dialog[type="inline"] .joomla-dialog-header')).toContainText('Keyboard Shortcuts');
  });
});
