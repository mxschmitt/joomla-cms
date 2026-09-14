// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that menu items site API endpoint', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteMenuItem({
      title: 'automated test site menu item'
    });
  });
  test('can deliver a list of site menu items types', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/menus/site/items/types');
    await expect(response.body.data[0].type).toContain('menutypes');
  });
  test('can deliver a list of site menu items', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test site menu item'
    });
    const response = await joomla.api_get('/menus/site/items');
    await joomla.api_responseContains(response, 'title', 'automated test site menu item');
  });
  test('can deliver a single site menu item', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuItem({
      title: 'automated test site menu item'
    });
    const response = await joomla.api_get(`/menus/site/items/${id}`);
    await expect(response.body.data.attributes.title).toContain('automated test site menu item');
  });
  test('can create a site menu item', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/menus/site/items', {
      title: 'automated test site menu item',
      menutype: 'main-menu',
      access: '1',
      parent_id: '1',
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
    await expect(response.body.data.attributes.title).toContain('automated test site menu item');
  });
  test('can update a site menu item', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuItem({
      title: 'updated automated test site menu item',
      type: 'component'
    });
    const response = await joomla.api_patch(`/menus/site/items/${id}`, {
      title: 'automated test site menu item',
      type: 'component',
      menuordering: id
    });
    await expect(response.body.data.attributes.title).toContain('automated test site menu item');
  });
  test('can delete a site menu item', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createMenuItem({
      title: 'automated test site menu item',
      published: -2
    });
    const response = await joomla.api_delete(`/menus/site/items/${id}`);
    await expect(response.status).toBe(204);
  });
});
