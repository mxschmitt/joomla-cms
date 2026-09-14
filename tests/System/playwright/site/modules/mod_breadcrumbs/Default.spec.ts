import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frondend that the breadcrumbs module', () => {
  test('can display the breadcrumb items', async ({ page, joomla }) => {
    await joomla.db_createModule({ module: 'mod_breadcrumbs' });
    await page.goto('/');
    await expect(page.locator('li').filter({ hasText: 'You are here:' }).first()).toBeVisible();
  });
});
