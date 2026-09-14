import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that redirect API endpoint', () => {
  test('can create a redirect', async ({ joomla }) => {
    const response = await joomla.api_post('/redirects', {
      comment: 'automated test redirect',
      header: 301,
      hits: 1,
      new_url: '/content/art/99',
      old_url: '/content/art/12',
      published: 1,
      referer: '',
    });
    expect(response.body.data.attributes.comment).toContain('automated test redirect');
  });

  test('can deliver a list of redirects', async ({ joomla }) => {
    const response = await joomla.api_get('/redirects');
    expect(response.body.data[0].attributes.comment).toBe('automated test redirect');
  });

  test('can deliver a single redirect', async ({ joomla }) => {
    const list = await joomla.api_get('/redirects');
    const id = list.body.data[0].attributes.id;
    const response = await joomla.api_get(`/redirects/${id}`);
    expect(response.body.data.attributes.new_url).toContain('/content/art/99');
  });

  test('can modify a single redirect', async ({ joomla }) => {
    const list = await joomla.api_get('/redirects');
    const id = list.body.data[0].attributes.id;
    const response = await joomla.api_patch(`/redirects/${id}`, { published: 0 });
    expect(response.body.data.attributes.published).toBe(0);
  });

  test('can delete a single redirect', async ({ joomla }) => {
    const list = await joomla.api_get('/redirects');
    const id = list.body.data[0].attributes.id;
    const patched = await joomla.api_patch(`/redirects/${id}`, { published: -2 });
    expect(patched.body.data.attributes.id).toBe(Math.abs(Number(id)));
    const deleted = await joomla.api_delete(`/redirects/${id}`);
    expect(deleted.status).toBe(204);
  });
});
