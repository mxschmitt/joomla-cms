// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that newsfeed categories API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteCategory({
      title: 'automated test feed category'
    });
  });
  test('can deliver a list of categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test category',
      extension: 'com_newsfeeds'
    });
    await joomla.db_createNewsFeed({
      name: 'automated test feed',
      catid: id
    });
    const response = await joomla.api_get('/newsfeeds/categories');
    await joomla.api_responseContains(response, 'title', 'automated test category');
  });
  test('can deliver a single category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test feed category',
      extension: 'com_newsfeeds'
    });
    const response = await joomla.api_get(`/newsfeeds/categories/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test feed category');
  });
  test('can create a category', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/newsfeeds/categories', {
      title: 'automated test feed category',
      description: 'automated test feed category description',
      parent_id: 1,
      extension: 'com_newsfeeds'
    });
    await expect(response.body.data.attributes.title).toContain('automated test feed category');
    await expect(response.body.data.attributes.description).toContain('automated test feed category description');
  });
  test('can update a category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test feed category',
      extension: 'com_newsfeeds'
    });
    const response = await joomla.api_patch(`/newsfeeds/categories/${id}`, {
      title: 'updated automated test feed category',
      description: 'automated test feed category description'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test feed category');
    await expect(response.body.data.attributes.description).toContain('automated test feed category description');
  });
});
