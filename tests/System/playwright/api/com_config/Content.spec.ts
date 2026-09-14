// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that config of com_content API endpoint', () => {
  test('can deliver a config of com_content', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/config/com_content');
    await expect(response.body.data[0].attributes.id).toBe(19);
  });
  test('can modify a single config of com_content', async ({
    page,
    joomla
  }) => {
    const updatedConfig = {
      show_title: '0'
    };
    const revertConfig = {
      show_title: '1'
    };
    let response = await joomla.api_patch('/config/com_content', updatedConfig);
    await expect(response.status).toBe(200);
    response = await joomla.api_patch('/config/com_content', revertConfig);
    await expect(response.status).toBe(200);
  });
});
