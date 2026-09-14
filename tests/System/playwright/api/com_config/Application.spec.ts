// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that config API endpoint', () => {
  test('can deliver a list of application config', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/config/application');
    await expect(response.body.data[0].attributes.offline).toBe(false);
  });
  test('can modify a single application config', async ({
    page,
    joomla
  }) => {
    const updatedConfig = {
      offline: true
    };
    const response = await joomla.api_patch('/config/application', updatedConfig);
    await expect(response.status).toBe(200);
    await joomla.config_setParameter('offline', false);
  });
});
