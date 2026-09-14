// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the who is online module', () => {
  test('can display who is online', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      title: 'Who is Online',
      module: 'mod_whosonline'
    });
    await page.goto('/');
    await expect(page.getByText('Who is Online').first()).toBeVisible();
  });
});
