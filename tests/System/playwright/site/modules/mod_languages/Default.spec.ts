// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the languages module', () => {
  test('can display languages', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Languages',
      module: 'mod_languages'
    });
    await page.goto('/');
    await expect(page.getByText('Languages')).toBeVisible();
  });
});
