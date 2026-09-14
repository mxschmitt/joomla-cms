// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command finder', () => {
  test('can index content', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php finder:index`)).stdout).toContain('Total Processing Time');
  });
  test('can purge and index content', async ({
    page,
    joomla
  }) => {
    await expect(expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php finder:index purge`)).stdout).toContain('Clear index')).toContain('Total Processing Time');
  });
});
