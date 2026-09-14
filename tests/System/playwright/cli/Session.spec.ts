// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command session', () => {
  test('can garbage collection', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php session:gc`)).stdout).toContain('Garbage collection completed');
  });
  test('can metadata garbage collection', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php session:metadata:gc`)).stdout).toContain('Metadata garbage collection completed');
  });
});
