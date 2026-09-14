// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the wrapper view', () => {
  test('can display wrapper', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test wrapper',
      link: 'index.php?option=com_wrapper&view=wrapper',
      params: JSON.stringify({
        url: 'http://localhost/administrator/index.php'
      })
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test wrapper' }).click();
    await expect(page.locator('.com-wrapper__iframe')).toBeVisible();
  });
});
