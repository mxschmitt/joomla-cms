// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that contacts API endpoint', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__contact_details');
  });
  test('can deliver a list of contacts', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'automated test contact'
    });
    const response = await joomla.api_get('/contacts');
    await expect(response.body.data[0].attributes.name).toContain('automated test contact');
  });
  test('can deliver a single contact', async ({
    page,
    joomla
  }) => {
    const contact = await joomla.db_createContact({
      name: 'automated test contact'
    });
    const response = await joomla.api_get(`/contacts/${contact.id}`);
    await expect(response.body.data.attributes.name).toContain('automated test contact');
  });
  test('can create a contact', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_contact'
    });
    const response = await joomla.api_post('/contacts', {
      name: 'automated test contact',
      alias: 'test-contact',
      catid: categoryId,
      published: 1,
      language: '*'
    });
    await expect(response.body.data.attributes.name).toContain('automated test contact');
  });
  test('can update a contact', async ({
    page,
    joomla
  }) => {
    const contact = await joomla.db_createContact({
      name: 'automated test contact',
      access: 1
    });
    const response = await joomla.api_patch(`/contacts/${contact.id}`, {
      name: 'updated automated test contact'
    });
    await expect(response.body.data.attributes.name).toContain('updated automated test contact');
  });
  test('can delete a contact', async ({
    page,
    joomla
  }) => {
    const contact = await joomla.db_createContact({
      name: 'automated test contact',
      published: -2
    });
    const result = await joomla.api_delete(`/contacts/${contact.id}`);
    expect(result.status).toBe(204);
  });
  test('check correct response for delete a not existent contact', async ({
    page,
    joomla
  }) => {
    const token = await joomla.api_getBearerToken();
    const response = await joomla.http({
      method: 'DELETE',
      url: '/api/index.php/v1/contacts/9999',
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    });
    expect(response.status).toBe(404);
    expect(response.body.data.message).to.include('Resource not found');
  });
  test('can submit a contact form', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_getUserId();
    const contact = await joomla.db_createContact({
      name: 'automated test contact',
      user_id: id,
      params: '{"show_email_form":"1"}'
    });
    const response = await joomla.api_post(`/contacts/form/${contact.id}`, {
      contact_name: joomla.expose.name,
      contact_email: joomla.expose.email,
      contact_subject: 'automated test subject',
      contact_message: 'automated test message'
    });
    await expect(response.status).toBe(200);
    const mails = await joomla.getMails();
    expect(mails.length).toBe(1);
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].receivers).toBeTruthy();
    await expect(mails[0].headers.subject).toBe(`${joomla.expose.sitename}: automated test subject`);
    await expect(mails[0].body).toContain('This is an enquiry email via');
    await expect(mails[0].body).toContain(`${joomla.expose.name} ${joomla.expose.email}`);
    await expect(mails[0].body).toContain('automated test message');
  });
});
