// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that contact categories API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteCategory({
      title: 'automated test contact category'
    });
  });
  test('can deliver a list of categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test contact category',
      extension: 'com_contact'
    });
    await joomla.db_createContact({
      name: 'automated test contact',
      catid: id
    });
    const response = await joomla.api_get('/contacts/categories');
    await joomla.api_responseContains(response, 'title', 'automated test contact category');
  });
  test('can deliver a list of published categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test contact category',
      extension: 'com_contact',
      published: 1
    });
    await joomla.db_createContact({
      name: 'automated test contact',
      catid: id
    });
    const response = await joomla.api_get('/contacts/categories?filter[state]=1');
    await joomla.api_responseContains(response, 'title', 'automated test contact category');
  });
  test('can deliver a list of unpublished categories', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test contact category',
      extension: 'com_contact',
      published: 0
    });
    await joomla.db_createContact({
      name: 'automated test contact',
      catid: id
    });
    const response = await joomla.api_get('/contacts/categories?filter[state]=0');
    await joomla.api_responseContains(response, 'title', 'automated test contact category');
  });
  test('can deliver a single category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test contact category',
      extension: 'com_contact'
    });
    const response = await joomla.api_get(`/contacts/categories/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test contact category');
  });
  test('can create a category', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/contacts/categories', {
      title: 'automated test contact category',
      description: 'automated test contact category description',
      parent_id: 1,
      extension: 'com_contacts'
    });
    await expect(response.body.data.attributes.title).toContain('automated test contact category');
    await expect(response.body.data.attributes.description).toContain('automated test contact category description');
  });
  test('can update a category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'automated test contact category',
      extension: 'com_contact'
    });
    const response = await joomla.api_patch(`/contacts/categories/${id}`, {
      title: 'updated automated test contact category',
      description: 'automated test contact category description'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test contact category');
    await expect(response.body.data.attributes.description).toContain('automated test contact category description');
  });
});
