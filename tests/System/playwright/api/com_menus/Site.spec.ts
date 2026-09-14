// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that menus site API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__menu_types WHERE title = 'automated test site menu' ");
  });
  test('can deliver a list of site menus', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuType({
      title: 'automated test site menu'
    });
    const response = await joomla.api_get('/menus/site');
    await joomla.api_responseContains(response, 'title', 'automated test site menu');
  });
  test('can deliver a single site menu', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuType({
      title: 'automated test site menu'
    });
    const response = await joomla.api_get(`/menus/site/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test site menu');
  });
  test('can create a site menu', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/menus/site', {
      client_id: 0,
      description: 'The menu for the site',
      menutype: 'menu',
      title: 'automated test site menu'
    });
    await expect(response.body.data.attributes.title).toContain('automated test site menu');
  });
  test('can update a site menu', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuType({
      title: 'automated test site menu'
    });
    const response = await joomla.api_patch(`/menus/site/${id}`, {
      title: 'updated automated test site menu'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test site menu');
  });
  test('can delete a site menu', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuType({
      title: 'automated test site menu'
    });
    await joomla.api_delete(`/menus/site/${id}`);
  });
});
