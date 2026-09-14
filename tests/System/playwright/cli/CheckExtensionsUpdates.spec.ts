// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command check extensions update', () => {
  test('can check update', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php update:extensions:check`)).stdout).toContain('There are no updates available');
  });
});
