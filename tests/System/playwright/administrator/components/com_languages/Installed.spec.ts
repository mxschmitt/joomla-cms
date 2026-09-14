// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the installed languages', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_languages&view=installed');
  });
  test('have a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Languages');
  });
  test('have English Language', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('tr.row0')).toContainText('English');
  });
  test('have a Language as default', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('span.icon-color-featured')).toBeVisible();
  });
  test('have install languages link', async ({
    page,
    joomla
  }) => {
    await expect(page.getByText(' Install Languages ').first()).toBeVisible();
  });
});
