// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that plugins API endpoint', () => {
  test('can deliver a list of plugins', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/plugins');
    await expect(response.body.data[0].attributes.folder).toContain('actionlog');
  });
  test('can deliver a single plugin', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/plugins');
    const id = response.body.data[0].attributes.id;
    response = await joomla.api_get(`/plugins/${id}`);
    await expect(response.body.data.attributes.folder).toContain('actionlog');
  });
  test('can modify a single plugin', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/plugins');
    const id = response.body.data[0].attributes.id;
    const updatedPlugin = {
      enabled: 0
    };
    response = await joomla.api_patch(`/plugins/${id}`, updatedPlugin);
    await expect(response.body.data.attributes.enabled).toBe(0);
    await joomla.db_enableExtension('1', 'plg_actionlog_joomla');
  });
});
