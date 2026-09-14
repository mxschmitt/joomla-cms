// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that modules types API endpoint', () => {
  test('can deliver a list of modules types administrator', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/modules/types/administrator');
    await expect(response.body.data[0].attributes.module).toContain('mod_latestactions');
  });
  test('can deliver a list of modules types site', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/modules/types/site');
    await expect(response.body.data[0].attributes.module).toContain('mod_articles');
  });
});
