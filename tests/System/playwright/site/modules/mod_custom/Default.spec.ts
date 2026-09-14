// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the custom module', () => {
  test('can display the custom text', async ({
    page,
    joomla
  }) => {
    await joomla.db_createModule({
      module: 'mod_custom',
      content: '<p>Automated test text</p>'
    });
    await page.goto('/');
    await expect(page.getByText('Automated test text').first()).toBeVisible();
  });
});
