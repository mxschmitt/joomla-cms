// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that console command scheduler', () => {
  test('can list scheduled tasks', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:list`)).stdout).toContain('Rotate Logs');
  });
  test('can update scheduled task state', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:state --id=1 --state=1 -n`)).stdout).toContain('Task ID 1 enabled.');
  });
  test('cannot update state of non-existent task', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:state --id=123 --state=1 -n`, {
      failOnNonZeroExit: false
    })).stdout).toContain("Task ID '123' does not exist!");
  });
  test('cannot update to non-existent state for a task', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:state --id=1 --state=123 -n`, {
      failOnNonZeroExit: false
    })).stdout).toContain('Invalid state passed!');
  });
  test('can run a task', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:run --id=1`)).stdout).toContain('Task#01 \'Rotate Logs\' processed in');
  });
  test('cannot run a non existent task', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:run --id=123`, {
      failOnNonZeroExit: false
    })).stdout).toContain('No matching task found!');
  });
  test('cannot run a not due task', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php scheduler:run`, {
      failOnNonZeroExit: false
    })).stdout).toContain('No tasks due!');
  });
});
