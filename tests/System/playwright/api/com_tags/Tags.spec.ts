// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that tags API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__tags WHERE id > 1');
  });
  test('can deliver a list of tags', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'automated test tag'
    });
    const response = await joomla.api_get('/tags');
    await expect(response.body.data[0].attributes.title).toContain('automated test tag');
  });
  test('can create a tag', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/tags', {
      title: 'automated test tag',
      parent_id: 1,
      level: 1,
      description: '',
      language: '*'
    });
    await expect(response.body.data.attributes.title).toContain('automated test tag');
  });
  test('can update a tag', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createTag({
      title: 'automated test tag'
    });
    const response = await joomla.api_patch(`/tags/${id}`, {
      title: 'updated automated test tag'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test tag');
  });
  test('can delete a tag', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createTag({
      title: 'automated test tag',
      published: -2
    });
    await joomla.api_delete(`/tags/${id}`);
  });
});
