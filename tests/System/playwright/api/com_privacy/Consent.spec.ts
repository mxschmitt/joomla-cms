// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test privacy consent API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__privacy_consents');
  });
  test('can get a list of consents', async ({
    page,
    joomla
  }) => {
    await joomla.db_createPrivacyConsent({
      body: 'test body'
    });
    const response = await joomla.api_get('/privacy/consents');
    await joomla.api_responseContains(response, 'body', 'test body');
  });
  test('can list a single consent', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createPrivacyConsent({
      body: 'test body'
    });
    const response = await joomla.api_get(`/privacy/consents/${id}`);
    await expect(response.body.data.attributes.body).toContain('test body');
  });
});
