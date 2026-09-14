// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command config', () => {
  test('can get sitename', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get sitename`)).stdout).toContain(joomla.expose.sitename);
  });
  test('can set sitename', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:set sitename="${joomla.expose.sitename}"`)).stdout).toContain('[OK] Configuration set');
  });
  test('can not set invalid database name', async ({
    page,
    joomla
  }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:set db=invalid`, {
      failOnNonZeroExit: false
    });
    await expect(result.exitCode).toBe(4);
    await expect(result.stdout).toContain('[ERROR] Cannot connect to database');
  });
});
