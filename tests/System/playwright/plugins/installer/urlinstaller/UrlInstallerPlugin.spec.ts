// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the url installer plugin', () => {
  test('is shown in extension installer', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_installer&view=install');
    await page.locator('button[role="tab"]').filter({ hasText: 'Install from URL' }).click();
    await expect(page.locator('legend').filter({
      hasText: 'Install from URL'
    })).toBeVisible();
  });
});
