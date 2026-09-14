// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that modules administrator API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__modules WHERE title = 'automated test administrator module'");
  });
  test('can deliver a list of administrator modules', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/modules/administrator');
    await expect(response.body.data[0].attributes.module).toContain('mod_sampledata');
  });
  test('can deliver a single administrator module', async ({
    page,
    joomla
  }) => {
    const module = await joomla.db_createModule({
      title: 'automated test administrator module',
      client_id: 1
    });
    const response = await joomla.api_get(`/modules/administrator/${module}`);
    await expect(response.body.data.attributes.title).toContain('automated test administrator module');
  });
  test('can create an administrator module', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/modules/administrator', {
      access: '1',
      assigned: ['101', '105'],
      assignment: '0',
      client_id: '1',
      language: '0',
      module: 'mod_version',
      note: '',
      ordering: '1',
      params: {
        bootstrap_size: '0',
        cache: '1',
        cache_time: '900',
        cachemode: 'static',
        count: '10',
        header_class: '',
        header_tag: 'h3',
        layout: '_:default',
        module_tag: 'div',
        moduleclass_sfx: '',
        style: '0'
      },
      position: '',
      publish_down: '',
      publish_up: '',
      published: '1',
      showtitle: '1',
      title: 'automated test administrator module'
    });
    await expect(response.body.data.attributes.title).toContain('automated test administrator module');
  });
  test('can update an administrator module', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createModule({
      title: 'automated test administrator module',
      client_id: 1
    });
    const updatedModuleData = {
      published: -2
    };
    const response = await joomla.api_patch(`/modules/administrator/${id}`, updatedModuleData);
    await expect(response.body.data.attributes.published).toBe(-2);
  });
  test('can delete a administrator module', async ({
    page,
    joomla
  }) => {
    const module = await joomla.db_createModule({
      title: 'automated test administrator module',
      published: -2,
      client_id: 1
    });
    const response = await joomla.api_delete(`/modules/administrator/${module}`);
    await expect(response.status).toBe(204);
  });
});
