// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test privacy request API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__privacy_requests');
  });
  test('can get a list of requests', async ({
    page,
    joomla
  }) => {
    await joomla.db_createPrivacyRequest();
    const response = await joomla.api_get('/privacy/requests');
    await joomla.api_responseContains(response, 'email', 'test@example.com');
  });
  test('can list a single request', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createPrivacyRequest();
    const response = await joomla.api_get(`/privacy/requests/${id}`);
    await expect(response.body.data.attributes.status).toBe(0);
  });
  test('can create a request', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/privacy/requests ', {
      email: 'test@example.com',
      request_type: 'export'
    });
    await expect(response.body.data.attributes.email).toContain('test@example.com');
  });
});
