// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the footer module', () => {
  test('can display the copyright message from Joomla', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      module: 'mod_footer'
    });
    await page.goto('/');
    await expect(page.getByText('All Rights Reserved').first()).toBeVisible();
  });
});
