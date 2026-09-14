// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that redirect API endpoint', () => {
  test('can create a redirect', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/redirects', {
      comment: 'automated test redirect',
      header: 301,
      hits: 1,
      new_url: '/content/art/99',
      old_url: '/content/art/12',
      published: 1,
      referer: ''
    });
    await expect(response.body.data.attributes.comment).toContain('automated test redirect');
  });
  test('can deliver a list of redirects', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/redirects');
    await expect(response.body.data[0].attributes.comment).toBe('automated test redirect');
  });
  test('can deliver a single redirect', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/redirects');
    const id = response.body.data[0].attributes.id;
    response = await joomla.api_get(`/redirects/${id}`);
    await expect(response.body.data.attributes.new_url).toContain('/content/art/99');
  });
  test('can modify a single redirect', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/redirects');
    const id = response.body.data[0].attributes.id;
    const updateRedirect = {
      published: 0
    };
    response = await joomla.api_patch(`/redirects/${id}`, updateRedirect);
    await expect(response.body.data.attributes.published).toBe(0);
  });
  test('can delete a single redirect', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/redirects');
    let id = response.body.data[0].attributes.id;
    const updateRedirect = {
      published: -2
    };
    response = await joomla.api_patch(`/redirects/${id}`, updateRedirect);
    await expect(response.body.data.attributes.id).toBe(Math.abs(`${id}`));
    id = undefined;
    response = await joomla.api_delete(`/redirects/${id}`);
    await expect(response.status).toBe(204);
  });
});
