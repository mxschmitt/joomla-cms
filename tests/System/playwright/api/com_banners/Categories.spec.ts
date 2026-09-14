// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that banners categories API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteCategory({
      title: 'automated test banner category'
    });
  });
  test('can deliver a list of categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test banner category',
      extension: 'com_banners'
    });
    await joomla.db_createBanner({
      name: 'automated test banner',
      catid: id
    });
    const response = await joomla.api_get('/banners/categories');
    await joomla.api_responseContains(response, 'title', 'automated test banner category');
  });
  test('can deliver a list of published categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test banner category',
      extension: 'com_banners',
      published: 1
    });
    await joomla.db_createBanner({
      name: 'automated test banner',
      catid: id
    });
    const response = await joomla.api_get('/banners/categories?filter[state]=1');
    await joomla.api_responseContains(response, 'title', 'automated test banner category');
  });
  test('can deliver a list of unpublished categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test banner category',
      extension: 'com_banners',
      published: 0
    });
    await joomla.db_createBanner({
      name: 'automated test banner',
      catid: id
    });
    const response = await joomla.api_get('/banners/categories?filter[state]=0');
    await joomla.api_responseContains(response, 'title', 'automated test banner category');
  });
  test('can deliver a single category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test banner category',
      extension: 'com_banners'
    });
    const response = await joomla.api_get(`/banners/categories/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test banner category');
  });
  test('can create a category', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/banners/categories', {
      title: 'automated test banner category',
      description: 'automated test banner category description',
      parent_id: 1,
      extension: 'com_banners'
    });
    await expect(response.body.data.attributes.title).toContain('automated test banner category');
    await expect(response.body.data.attributes.description).toContain('automated test banner category description');
  });
  test('can update a category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test banner category',
      extension: 'com_banners'
    });
    const response = await joomla.api_patch(`/banners/categories/${id}`, {
      title: 'updated automated test banner category',
      description: 'automated test banner category description'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test banner category');
    await expect(response.body.data.attributes.description).toContain('automated test banner category description');
  });
});
