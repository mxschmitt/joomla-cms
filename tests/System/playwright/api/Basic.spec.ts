// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test that the API', () => {
  test('returns unauthorized return code when a malformed token is set', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.http({
      method: 'GET',
      url: '/api/index.php/v1/content/articles',
      headers: {
        Authorization: 'Bearer 123'
      },
      failOnStatusCode: false
    })).status).toBe(401);
  });
  test('returns unauthorized return code when no token is set', async ({
    page,
    joomla
  }) => {
    await expect((await joomla.http({
      method: 'GET',
      url: '/api/index.php/v1/content/articles',
      failOnStatusCode: false
    })).status).toBe(401);
  });
  test('returns not found return code when wrong route is set', async ({
    page,
    joomla
  }) => {
    const token = await joomla.api_getBearerToken();
    await expect((await joomla.http({
      method: 'GET',
      url: '/api/index.php/v1/invalid',
      headers: {
        Authorization: `Bearer ${token}`
      },
      failOnStatusCode: false
    })).status).toBe(404);
  });
});
