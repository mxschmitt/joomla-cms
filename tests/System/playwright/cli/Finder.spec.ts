import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command finder', () => {
  test('can index content', async ({ joomla }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php finder:index`);
    expect(result.stdout).toContain('Total Processing Time');
  });

  test('can purge and index content', async ({ joomla }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php finder:index purge`);
    expect(result.stdout).toContain('Clear index');
    expect(result.stdout).toContain('Total Processing Time');
  });
});
