// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command user', () => {
  test('can list users', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php user:list`)).stdout).toContain(`${joomla.expose.username}`);
  });
  test('can add a user', async ({
    page,
    joomla
  }) => {
    const para = '--username=test --name=test --password=123456789012 --email=test@530.test --usergroup=Manager -n';
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php user:add ${para}`)).stdout).toContain('User created!');
  });
  test('can reset password', async ({
    page,
    joomla
  }) => {
    const para = '--username=test --password=abcdefghilmno -n';
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php user:reset-password ${para}`)).stdout).toContain('Password changed!');
  });
  test('can add a user to user group', async ({
    page,
    joomla
  }) => {
    const para = '--username=test --group=Registered -n';
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php user:addtogroup ${para}`)).stdout).toContain("Added 'test' to group 'Registered'!");
  });
  test('can remove a user from user group', async ({
    page,
    joomla
  }) => {
    const para = '--username=test --group=Registered -n';
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php user:removefromgroup ${para}`)).stdout).toContain("Removed 'test' from group 'Registered'!");
  });
  test('can delete a user', async ({
    page,
    joomla
  }) => {
    const para = '--username=test -n';
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php user:delete ${para}`)).stdout).toContain('User test deleted!');
  });
});
