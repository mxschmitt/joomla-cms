// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that media adapters API endpoint', () => {
  test('can deliver a list of adapters', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/adapters');
    await expect(response.body.data[0].attributes.provider_id).toContain('local');
  });
  test('can deliver a specific adapter', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/adapters/local-images');
    await expect(response.body.data.attributes.provider_id).toContain('local');
  });
});
