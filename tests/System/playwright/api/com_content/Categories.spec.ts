// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that content categories API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteCategory({
      title: 'automated test content category'
    });
  });
  test('can deliver a list of categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test content category',
      extension: 'com_content'
    });
    await joomla.db_createArticle({
      title: 'automated test article',
      catid: id
    });
    const response = await joomla.api_get('/content/categories');
    await joomla.api_responseContains(response, 'title', 'automated test content category');
  });
  test('can deliver a list of published categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test content category',
      extension: 'com_content',
      published: 1
    });
    await joomla.db_createArticle({
      title: 'automated test article',
      catid: id
    });
    const response = await joomla.api_get('/content/categories?filter[state]=1');
    await joomla.api_responseContains(response, 'title', 'automated test content category');
  });
  test('can deliver a list of unpublished categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test content category',
      extension: 'com_content',
      published: 0
    });
    await joomla.db_createArticle({
      title: 'automated test article',
      catid: id
    });
    const response = await joomla.api_get('/content/categories?filter[state]=0');
    await joomla.api_responseContains(response, 'title', 'automated test content category');
  });
  test('can deliver a single category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test content category',
      extension: 'com_content'
    });
    const response = await joomla.api_get(`/content/categories/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test content category');
  });
  test('can create a category', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/content/categories', {
      title: 'automated test content category',
      description: 'automated test content category description',
      parent_id: 1,
      extension: 'com_content'
    });
    await expect(response.body.data.attributes.title).toContain('automated test content category');
    await expect(response.body.data.attributes.description).toContain('automated test content category description');
  });
  test('can update a category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test content category',
      extension: 'com_content'
    });
    const response = await joomla.api_patch(`/content/categories/${id}`, {
      title: 'updated automated test content category',
      description: 'automated test content category description'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test content category');
    await expect(response.body.data.attributes.description).toContain('automated test content category description');
  });
});
