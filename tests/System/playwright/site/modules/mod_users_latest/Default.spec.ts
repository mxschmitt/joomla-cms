// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users latest module', () => {
  test('can display the latest registered users', async ({
    page,
    joomla
  }) => {
    await joomla.db_createUser({
      username: 'automatedtestuser'
    });
    await joomla.db_createModule({
      module: 'mod_users_latest'
    });
    await page.goto('/');
    await expect(page.getByText('automatedtestuser').filter({ visible: true }).first()).toBeVisible();
  });
});
