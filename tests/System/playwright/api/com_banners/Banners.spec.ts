// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that banners API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__banners');
  });
  test('can deliver a list of banners', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'automated test banner'
    });
    const response = await joomla.api_get('/banners');
    await expect(response.body.data[0].attributes.name).toContain('automated test banner');
  });
  test('can deliver a list of unpublished banners', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'automated test banner',
      state: 0
    });
    const response = await joomla.api_get('/banners?filter[state]=0');
    await expect(response.body.data[0].attributes.name).toContain('automated test banner');
  });
  test('can deliver a list of published banners', async ({
    page,
    joomla
  }) => {
    await joomla.db_createBanner({
      name: 'automated test banner',
      state: 1
    });
    const response = await joomla.api_get('/banners?filter[state]=1');
    await expect(response.body.data[0].attributes.name).toContain('automated test banner');
  });
  test('can deliver a single banner', async ({
    page,
    joomla
  }) => {
    const banner = await joomla.db_createBanner({
      name: 'automated test banner'
    });
    const response = await joomla.api_get(`/banners/${banner.id}`);
    await expect(response.body.data.attributes.name).toContain('automated test banner');
  });
  test('can create a banner', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_banners'
    });
    const response = await joomla.api_post('/banners', {
      name: 'automated test banner',
      alias: 'test-banner',
      catid: categoryId,
      state: 1,
      language: '*',
      description: '',
      custombannercode: '',
      params: {
        imageurl: '',
        width: '',
        height: '',
        alt: ''
      }
    });
    await expect(response.body.data.attributes.name).toContain('automated test banner');
  });
  test('can update a banner', async ({
    page,
    joomla
  }) => {
    const banner = await joomla.db_createBanner({
      name: 'automated test banner'
    });
    const response = await joomla.api_patch(`/banners/${banner.id}`, {
      name: 'updated automated test banner'
    });
    await expect(response.body.data.attributes.name).toContain('updated automated test banner');
  });
  test('can delete a banner', async ({
    page,
    joomla
  }) => {
    const banner = await joomla.db_createBanner({
      name: 'automated test banner',
      state: -2
    });
    await joomla.api_delete(`/banners/${banner.id}`);
  });
  test('check correct response for delete a not existent banner', async ({
    page,
    joomla
  }) => {
    const token = await joomla.api_getBearerToken();
    const response = await joomla.http({
      method: 'DELETE',
      url: '/api/index.php/v1/banners/9999',
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    });
    expect(response.status).toBe(404);
    expect(response.body.data.message).to.include('Resource not found');
  });
  test('cannot delete a banner that is not trashed', async ({
    page,
    joomla
  }) => {
    const banner = await joomla.db_createBanner({
      name: 'automated test banner'
    });
    const token = await joomla.api_getBearerToken();
    const response = await joomla.http({
      method: 'DELETE',
      url: `/api/index.php/v1/banners/${banner.id}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    });
    expect(response.status).toBe(409);
    expect(response.body.data.message).to.include('must be trashed before it can be deleted');
  });
});
