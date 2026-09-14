// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that menus administrator API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__menu_types WHERE title = 'automated test administrator menu' ");
  });
  test('can deliver a list of administrator menus', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/menus/administrator');
    await expect(response.body.data[0].attributes.title).toContain('Main Menu');
  });
  test('can deliver a single administrator menu', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuType({
      title: 'automated test administrator menu',
      client_id: 1
    });
    const response = await joomla.api_get(`/menus/administrator/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test administrator menu');
  });
  test('can create an administrator menu', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/menus/administrator', {
      client_id: 1,
      description: 'The menu for the administrator',
      menutype: 'menu',
      title: 'automated test administrator menu'
    });
    await expect(response.body.data.attributes.title).toContain('automated test administrator menu');
  });
  test('can update an administrator menu', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuType({
      title: 'automated test administrator menu',
      client_id: 1
    });
    const response = await joomla.api_patch(`/menus/administrator/${id}`, {
      title: 'updated automated test administrator menu'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test administrator menu');
  });
  test('can delete an administrator menu', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuType({
      title: 'automated test administrator menu',
      client_id: 1
    });
    await joomla.api_delete(`/menus/administrator/${id}`);
  });
});
