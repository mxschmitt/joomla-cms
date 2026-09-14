// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that field contact API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__fields');
  });
  ['contact', 'mail', 'categories'].forEach(context => {
    test(`can deliver a list of fields (${context})`, async ({
      page,
      joomla
    }) => {
      await joomla.db_createField({
        title: `automated test field contacts ${context}`,
        context: `com_contact.${context}`
      });
      const response = await joomla.api_get(`/fields/contacts/${context}`);
      await expect(response.body.data[0].attributes.title).toContain(`automated test field contacts ${context}`);
    });
    test(`can deliver a single field (${context})`, async ({
      page,
      joomla
    }) => {
      const id = await joomla.db_createField({
        title: `automated test field contacts ${context}`,
        context: `com_contact.${context}`
      });
      const response = await joomla.api_get(`/fields/contacts/${context}/${id}`);
      await expect(response.body.data.attributes.title).toContain(`automated test field contacts ${context}`);
    });
    test(`can create a field (${context})`, async ({
      page,
      joomla
    }) => {
      const response = await joomla.api_post(`/fields/contacts/${context}`, {
        title: `automated test field contacts ${context}`,
        access: 1,
        context: `com_contact.${context}`,
        default_value: '',
        description: '',
        group_id: 0,
        label: 'contact field',
        language: '*',
        name: 'contact-field',
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
      await expect(response.body.data.attributes.title).toContain(`automated test field contacts ${context}`);
    });
    test(`can update a field (${context})`, async ({
      page,
      joomla
    }) => {
      const id = await joomla.db_createField({
        title: 'automated test field',
        context: `com_contact.${context}`
      });
      const response = await joomla.api_patch(`/fields/contacts/${context}/${id}`, {
        title: `updated automated test field ${context}`
      });
      await expect(response.body.data.attributes.title).toContain(`updated automated test field ${context}`);
    });
    test(`can delete a field (${context})`, async ({
      page,
      joomla
    }) => {
      const id = await joomla.db_createField({
        title: 'automated test field',
        context: `com_contact.${context}`,
        state: -2
      });
      await joomla.api_delete(`/fields/contacts/${context}/${id}`);
    });
  });
});
