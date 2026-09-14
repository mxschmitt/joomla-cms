// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the crop media action plugin', () => {
  test('is shown when editing an image', async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_media&view=file&mediatypes=0,1,2,3&path=local-images:/joomla_black.png');
    await page.locator('button[role="tab"]').filter({ hasText: 'Crop' }).click();
    await expect(page.locator('legend').filter({
      hasText: 'Crop'
    })).toBeVisible();
  });
});
