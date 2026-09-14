// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that templates administrator styles API endpoint', () => {
  test('can deliver a list of templates administrator styles', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/templates/styles/administrator');
    await expect(response.body.data[0].attributes.template).toContain('atum');
  });
  test('can deliver a single templates administrator style', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/templates/styles/administrator');
    const id = response.body.data[0].attributes.id;
    response = await joomla.api_get(`/templates/styles/administrator/${id}`);
    await expect(response.body.data.attributes.template).toContain('atum');
  });
  test('can modify a single template administrator style', async ({
    page,
    joomla
  }) => {
    let response = await joomla.api_get('/templates/styles/administrator');
    const id = response.body.data[0].attributes.id;
    const updatedStyle = {
      title: 'automated test template administrator style'
    };
    response = await joomla.api_patch(`/templates/styles/administrator/${id}`, updatedStyle);
    await expect(response.body.data.attributes.title).toBe('automated test template administrator style');
  });
});
