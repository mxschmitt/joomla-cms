// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that templates API endpoint', () => {
  test('can deliver a list of templates', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/templates/styles/site');
    await expect(response.body.data[0].attributes.template).toContain('cassiopeia');
  });
  test('can deliver a single template', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/templates/styles/site');
    const id = response.body.data[0].attributes.id;
    response = await joomla.api_get(`/templates/styles/site/${id}`);
    await expect(response.body.data.attributes.template).toContain('cassiopeia');
  });
  test('can modify a single template', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/templates/styles/site');
    const id = response.body.data[0].attributes.id;
    const updatedStyle = {
      title: 'automated test template site style'
    };
    response = await joomla.api_patch(`/templates/styles/site/${id}`, updatedStyle);
    await expect(response.body.data.attributes.title).toBe('automated test template site style');
  });
});
