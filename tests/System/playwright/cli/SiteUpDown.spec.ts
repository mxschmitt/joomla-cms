// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command site', () => {
  test('can set the site down', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php site:down`)).stdout).toContain('Website is now offline');
  });
  test('can set the site up', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php site:up`)).stdout).toContain('Website is now online');
  });
});
