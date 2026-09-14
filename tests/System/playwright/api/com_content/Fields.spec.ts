// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that field content API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__fields');
  });
  ['article', 'categories'].forEach(context => {
    const endpoint = context === 'article' ? 'articles' : context;
    test(`can deliver a list of fields (${context})`, async ({
      page,
      joomla
    }) => {
      await joomla.db_createField({
        title: `automated test field content ${context}`,
        context: `com_content.${context}`
      });
      let response = await joomla.api_get(`/fields/content/${endpoint}`);
      await expect(response.body.data[0].attributes.title).toContain(`automated test field content ${context}`);
    });
    test(`can deliver a single field (${context})`, async ({
      page,
      joomla
    }) => {
      let id = await joomla.db_createField({
        title: `automated test field content ${context}`,
        context: `com_content.${context}`
      });
      response = await joomla.api_get(`/fields/content/${endpoint}/${id}`);
      await expect(response.body.data.attributes.title).toContain(`automated test field content ${context}`);
    });
    test(`can create a field (${context})`, async ({
      page,
      joomla
    }) => {
      response = await joomla.api_post(`/fields/content/${endpoint}`, {
        title: `automated test field content ${context}`,
        access: 1,
        context: `com_content.${context}`,
        default_value: '',
        description: '',
        group_id: 0,
        label: 'content field',
        language: '*',
        name: `content-field-${context}`,
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
      await expect(response.body.data.attributes.title).toContain(`automated test field content ${context}`);
    });
    test(`can update a field (${context})`, async ({
      page,
      joomla
    }) => {
      id = await joomla.db_createField({
        title: 'automated test field',
        context: `com_content.${context}`,
        access: 1
      });
      response = await joomla.api_patch(`/fields/content/${endpoint}/${id}`, {
        title: `updated automated test field ${context}`
      });
      await expect(response.body.data.attributes.title).toContain(`updated automated test field ${context}`);
    });
    test(`can delete a field (${context})`, async ({
      page,
      joomla
    }) => {
      id = await joomla.db_createField({
        title: 'automated test field',
        context: `com_content.${context}`,
        state: -2
      });
      await joomla.api_delete(`/fields/content/${endpoint}/${id}`);
    });
  });
});
