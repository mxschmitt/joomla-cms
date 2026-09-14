// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that banners clients API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__banner_clients');
  });
  test('can deliver a list of clients', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBannerClient({
      name: 'automated test banner client'
    });
    const response = await joomla.api_get('/banners/clients');
    await expect(response.body.data[0].attributes.name).toContain('automated test banner client');
  });
  test('can deliver a single client', async ({
    page,
    joomla
  }) => {
    const bannerclient = await joomla.db_createBannerClient({
      name: 'automated test banner client'
    });
    const response = await joomla.api_get(`/banners/clients/${bannerclient.id}`);
    await expect(response.body.data.attributes.name).toContain('automated test banner client');
  });
  test('can create a client', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/banners/clients', {
      name: 'automated test banner client',
      contact: 'automated test banner client',
      state: 1,
      extrainfo: ''
    });
    await expect(response.body.data.attributes.name).toContain('automated test banner client');
  });
  test('can update a client', async ({
    page,
    joomla
  }) => {
    const bannerclient = await joomla.db_createBannerClient({
      name: 'automated test banner client'
    });
    const response = await joomla.api_patch(`/banners/clients/${bannerclient.id}`, {
      name: 'updated automated test banner client'
    });
    await expect(response.body.data.attributes.name).toContain('updated automated test banner client');
  });
  test('can delete a client', async ({
    page,
    joomla
  }) => {
    const bannerclient = await joomla.db_createBannerClient({
      name: 'automated test banner client',
      state: -2
    });
    await joomla.api_delete(`/banners/clients/${bannerclient.id}`);
  });
});
