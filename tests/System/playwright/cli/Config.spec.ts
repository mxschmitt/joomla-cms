import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command config', () => {
  test('can get sitename', async ({ joomla }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get sitename`);
    expect(result.stdout).toContain(joomla.expose.sitename);
  });

  test('can set sitename', async ({ joomla }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:set sitename="${joomla.expose.sitename}"`);
    expect(result.stdout).toContain('[OK] Configuration set');
  });

  test('can not set invalid database name', async ({ joomla }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:set db=invalid`, {
      failOnNonZeroExit: false,
    });
    expect(result.exitCode).toBe(4);
    expect(result.stdout).toContain('[ERROR] Cannot connect to database');
  });
});
