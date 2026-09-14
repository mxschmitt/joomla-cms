// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that menu items administrator API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__menu WHERE title = 'automated test administrator menu item' ");
  });
  test('can deliver a list of administrator menu items types', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/menus/administrator/items/types');
    await expect(response.body.data[0].type).toContain('menutypes');
  });
  test('can deliver a list of administrator menu items', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test administrator menu item',
      client_id: 1
    });
    const response = await joomla.api_get('/menus/administrator/items');
    await joomla.api_responseContains(response, 'title', 'automated test administrator menu item');
  });
  test('can deliver a single administrator menu item', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuItem({
      title: 'automated test administrator menu item',
      client_id: 1
    });
    const response = await joomla.api_get(`/menus/administrator/items/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test administrator menu item');
  });
  test('can create an administrator menu item', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/menus/administrator/items', {
      title: 'automated test administrator menu item',
      menutype: 'main-menu',
      access: '1',
      parent_id: '1',
      client_id: 1,
      publish_down: '',
      publish_up: '',
      published: '1',
      template_style_id: '0',
      toggle_modules_assigned: '1',
      toggle_modules_published: '1',
      type: 'component',
      alias: '',
      link: ''
    });
    await expect(response.body.data.attributes.title).toContain('automated test administrator menu item');
  });
  test('can update an administrator menu item', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuItem({
      title: 'automated test administrator menu item',
      type: 'component',
      client_id: 1
    });
    const response = await joomla.api_patch(`/menus/administrator/items/${id}`, {
      title: 'updated automated test administrator menu item',
      type: 'component',
      menuordering: id
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test administrator menu item');
  });
  test('can delete an administrator menu item', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuItem({
      title: 'automated test administrator menu item',
      published: -2,
      client_id: 1
    });
    await joomla.api_delete(`/menus/administrator/items/${id}`);
  });
});
