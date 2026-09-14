// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that languages API endpoint', () => {
  test('can deliver a list of languages', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/languages');
    if (response?.body?.data.length === 0) {
      await expect(response.body.data).toHaveLength(0);
      await expect(response.body.links.self).toContain('/api/index.php/v1/languages');
    } else {
      await expect(response.body.data[0].type).toContain('languages');
    }
  });
});
