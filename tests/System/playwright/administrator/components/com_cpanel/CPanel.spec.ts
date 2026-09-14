// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the cpanel system dashboard', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_cpanel&view=cpanel&dashboard=system');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1').filter({
      hasText: 'System Dashboard'
    })).toBeVisible();
  });
  test('can display the modules', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h2').filter({
      hasText: 'Setup'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'Install'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'Templates'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'Maintenance'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'Manage'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'Information'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'Update'
    })).toBeVisible();
    await expect(page.locator('h2').filter({
      hasText: 'User Permissions '
    })).toBeVisible();
  });
});
