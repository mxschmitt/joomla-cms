// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that field users API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__fields');
  });
  test('can deliver a list of fields', async ({
    page,
    joomla
  }) => {
    await joomla.db_createField({
      title: 'automated test field',
      context: 'com_users.user'
    });
    const response = await joomla.api_get('/fields/users');
    await expect(response.body.data[0].attributes.title).toContain('automated test field');
  });
  test('can deliver a single field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createField({
      title: 'automated test field user',
      context: 'com_users.user'
    });
    const response = await joomla.api_get(`/fields/users/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test field user');
  });
  test('can create a field', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/fields/users', {
      title: 'automated test field',
      access: 1,
      context: 'com_users.user',
      default_value: '',
      description: '',
      group_id: 0,
      label: 'user field',
      language: '*',
      name: 'user-field',
      note: '',
      params: {
        class: '',
        display: '2',
        display_readonly: '2',
        hint: '',
        label_class: '',
        label_render_class: '',
        layout: '',
        prefix: '',
        render_class: '',
        show_on: '',
        showlabel: '1',
        suffix: ''
      },
      required: 0,
      state: 1,
      type: 'text'
    });
    await expect(response.body.data.attributes.title).toContain('automated test field');
  });
  test('can update a field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createField({
      title: 'automated test field',
      context: 'com_users.user'
    });
    const response = await joomla.api_patch(`/fields/users/${id}`, {
      title: 'updated automated test field'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test field');
  });
  test('can delete a field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createField({
      title: 'automated test field',
      state: -2
    });
    await joomla.api_delete(`/fields/users/${id}`);
  });
});
