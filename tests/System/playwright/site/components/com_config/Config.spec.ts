// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the config config view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
  });
  test('can edit site configuration without menu item', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_config&view=config');
    expect(await page.title()).toBe('Home');
    await page.locator('#jform_sitename_pagetitles').selectOption({
      label: 'After'
    });
    await page.locator('#application-form button[data-submit-task="config.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    expect(await page.title()).toBe(`Home - ${joomla.expose.sitename}`);
    await page.locator('#jform_sitename_pagetitles').selectOption({
      label: 'No'
    });
    await page.locator('#application-form button[data-submit-task="config.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    expect(await page.title()).toBe('Home');
  });
  test('can edit site configuration with menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test site configuration',
      link: 'index.php?option=com_config&view=config'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test site configuration' }).click();
    expect(await page.title()).toBe('automated test site configuration');
    await expect(page.locator('head meta[name=description]')).toHaveCount(0);
    await page.locator('#jform_MetaDesc').fill("").fill('test meta description');
    await page.locator('#application-form button[data-submit-task="config.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    expect(await page.locator('head meta[name=description]').getAttribute('content')).toContain('test meta description');
    await page.locator('#jform_MetaDesc').fill("");
    await page.locator('#application-form button[data-submit-task="config.apply"]').click();
    await joomla.checkForSystemMessage('Configuration saved.');
    await expect(page.locator('head meta[name=description]')).toHaveCount(0);
  });
  test('can toggle inline help options', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_config&view=config');
    await expect(page.locator('#jform_access-desc')).toBeHidden();
    await page.locator('button.button-inlinehelp').click();
    await expect(page.locator('#jform_access-desc')).toBeVisible();
    await page.locator('button.button-inlinehelp').click();
    await expect(page.locator('#jform_access-desc')).toBeHidden();
  });
});
