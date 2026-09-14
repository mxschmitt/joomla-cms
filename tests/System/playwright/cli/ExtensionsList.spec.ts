// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command list extensions', () => {
  test('can list extensions by type component', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=component`)).stdout).toContain('com_admin');
  });
  test('can list extensions by type file', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=file`)).stdout).toContain('files_joomla');
  });
  test('can list extensions by type language', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=language`)).stdout).toContain('English (en-GB)');
  });
  test('can list extensions by type library', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=library`)).stdout).toContain('lib_joomla');
  });
  test('can list extensions by type module', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=module`)).stdout).toContain('mod_custom');
  });
  test('can list extensions by type package', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=package`)).stdout).toContain('English (en-GB) Language Pack');
  });
  test('can list extensions by type plugin', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=plugin`)).stdout).toContain('plg_authentication_joomla');
  });
  test('can list extensions by type template', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php extension:list --type=template`)).stdout).toContain('cassiopeia');
  });
});
