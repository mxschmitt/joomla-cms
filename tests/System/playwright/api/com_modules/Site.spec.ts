// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that modules site API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__modules WHERE title = 'automated test site module'");
  });
  test('can deliver a list of site modules', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/modules/site');
    await expect(response.body.data[0].attributes.module).toContain('mod_breadcrumbs');
  });
  test('can deliver a single site module', async ({
    page,
    joomla
  }) => {
    const module = await joomla.db_createModule({
      title: 'automated test site module'
    });
    const response = await joomla.api_get(`/modules/site/${module}`);
    await expect(response.body.data.attributes.title).toContain('automated test site module');
  });
  test('can create a site module', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/modules/site', {
      access: '1',
      assigned: ['101', '105'],
      assignment: '0',
      client_id: '0',
      language: '0',
      module: 'mod_articles_archive',
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
      title: 'automated test site module'
    });
    await expect(response.body.data.attributes.title).toContain('automated test site module');
  });
  test('can update a site module', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createModule({
      title: 'automated test site module'
    });
    const updatedModuleData = {
      published: -2
    };
    const response = await joomla.api_patch(`/modules/site/${id}`, updatedModuleData);
    await expect(response.body.data.attributes.published).toBe(-2);
  });
  test('can delete a site module', async ({
    page,
    joomla
  }) => {
    const module = await joomla.db_createModule({
      title: 'automated test site module',
      published: -2
    });
    const response = await joomla.api_delete(`/modules/site/${module}`);
    await expect(response.status).toBe(204);
  });
});
