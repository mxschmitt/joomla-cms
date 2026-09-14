// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command cache', () => {
  test('can clean cache', async ({
    page,
    joomla
  }) => {
    const cachedFile = joomla.expose.cmsPath + 'administrator/cache/test.txt';
    await joomla.writeRelativeFile({
      path: 'administrator/cache/test.txt',
      content: 'test delete file from cache',
      mode: 0o666
    });
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php cache:clean`)).stdout).toContain('Cache cleaned');
    await expect(joomla.fileExists(cachedFile)).toBe(false);
  });
});
