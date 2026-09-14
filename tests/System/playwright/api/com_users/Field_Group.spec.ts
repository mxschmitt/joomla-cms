// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that group field user API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__fields_groups');
  });
  test('can deliver a list of group fields', async ({
    page,
    joomla
  }) => {
    await joomla.db_createFieldGroup({
      title: 'automated test group field users',
      context: 'com_users.user'
    });
    const response = await joomla.api_get('/fields/groups/users');
    await expect(response.body.data[0].attributes.title).toContain('automated test group field users');
  });
  test('can deliver a single group field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createFieldGroup({
      title: 'automated test group field users',
      context: 'com_users.user'
    });
    const response = await joomla.api_get(`/fields/groups/users/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test group field users');
  });
  test('can create a group field', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/fields/groups/users', {
      title: 'automated test group field users',
      access: 1,
      context: 'com_users.user',
      default_value: '',
      description: '',
      group_id: 0,
      label: 'user group field',
      language: '*',
      name: 'user-group_field',
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
    await expect(response.body.data.attributes.title).toContain('automated test group field users');
  });
  test('can update a group field ()', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createFieldGroup({
      title: 'automated test group field',
      access: 1,
      context: 'com_users.user'
    });
    const response = await joomla.api_patch(`/fields/groups/users/${id}`, {
      title: 'updated automated test group field'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test group field');
  });
  test('can delete a group field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createFieldGroup({
      title: 'automated test group field',
      context: 'com_users.user',
      state: -2
    });
    await joomla.api_delete(`/fields/groups/users/${id}`);
  });
});
