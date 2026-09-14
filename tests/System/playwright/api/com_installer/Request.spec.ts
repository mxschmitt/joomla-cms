// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that installer API endpoint', () => {
  test('can deliver a list of extensions', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/extensions');
    await expect(response.body.data[0].attributes.name).toContain('Action Log - Joomla');
  });
});
