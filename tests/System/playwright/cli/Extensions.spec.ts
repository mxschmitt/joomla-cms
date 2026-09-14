// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command extension', () => {
  test('can disable an extension', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:disable 1`)).stdout).toContain('[OK] Component with ID of 1 com_wrapper disabled');
  });
  test('cannot disable a non existent extension', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:disable 2025`, {
      failOnNonZeroExit: false
    })).stdout).toContain('[ERROR] Extension with ID of 2025 not found');
  });
  test('can enable an extension', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:enable 1`)).stdout).toContain('[OK] Component with ID of 1 com_wrapper enabled');
  });
  test('cannot enable a non existent extension', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:enable 2025`, {
      failOnNonZeroExit: false
    })).stdout).toContain('[ERROR] Extension with ID of 2025 not found');
  });
});
