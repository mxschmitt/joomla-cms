// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the config modules view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
  });
  test('can edit a module', async ({
    page,
    joomla
  }) => {
    await page.goto('/');
    await expect(page.locator('nav.mod-breadcrumbs__wrapper li.mod-breadcrumbs__here')).toBeVisible();
    await expect(page.locator('nav.mod-breadcrumbs__wrapper li.mod-breadcrumbs__divider')).toHaveCount(0);
    await page.locator('nav.mod-breadcrumbs__wrapper a.jmodedit').click();
    expect(await page.title()).toBe('Module Settings');
    await page.locator('#options button.accordion-button').filter({
      hasText: 'Options'
    }).click();
    await page.locator('#jform_params_showHere0').click();
    await page.locator('#modules-form button[data-submit-task="modules.apply"]').click();
    await joomla.checkForSystemMessage('Module saved.');
    await expect(page.locator('nav.mod-breadcrumbs__wrapper li.mod-breadcrumbs__here')).toHaveCount(0);
    await expect(page.locator('nav.mod-breadcrumbs__wrapper li.mod-breadcrumbs__divider')).toBeVisible();
    await page.locator('#options button.accordion-button').filter({
      hasText: 'Options'
    }).click();
    await page.locator('#jform_params_showHere1').click();
    await page.locator('#modules-form button[data-submit-task="modules.save"]').click();
    await joomla.checkForSystemMessage('Module saved.');
  });
});
