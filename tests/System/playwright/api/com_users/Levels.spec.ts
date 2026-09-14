// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that users access levels API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__viewlevels WHERE title LIKE '%automated test level%'");
  });
  test('can deliver a list of user access levels', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/users/levels');
    await expect(response.body.data[0].attributes.title).toContain('Public');
  });
  test('can deliver a single users access level', async ({
    page,
    joomla
  }) => {
    const level = await joomla.db_createUserLevel({
      title: 'automated test level'
    });
    const response = await joomla.api_get(`/users/levels/${level.id}`);
    await expect(response.body.data.attributes.title).toContain('automated test level');
  });
  test('can create a users access level', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/users/levels', {
      id: '0',
      title: 'automated test level',
      rules: [1]
    });
    await expect(response.body.data.attributes.title).toContain('automated test level');
  });
  test('can update a users access level', async ({
    page,
    joomla
  }) => {
    const level = await joomla.db_createUserLevel({
      title: 'automated test level'
    });
    const response = await joomla.api_patch(`/users/levels/${level.id}`, {
      title: 'updated automated test level'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test level');
  });
  test('can delete a user access level', async ({
    page,
    joomla
  }) => {
    const level = await joomla.db_createUserLevel({
      title: 'automated test level'
    });
    await joomla.api_delete(`/users/levels/${level.id}`);
  });
  test('can patch a users access level and check the rules', async ({
    page,
    joomla
  }) => {
    const createResponse = await joomla.api_post('/users/levels', {
      id: '0',
      title: 'automated test level',
      rules: [1, 2]
    });
    const createdId = createResponse.body.data.id;
    const patchResponse = await joomla.api_patch(`/users/levels/${createdId}`, {
      title: 'updated automated test level'
    });
    expect(patchResponse.status).toBe(200);
    await expect(patchResponse.body.data.attributes.title).toBe('updated automated test level');
    const rules = patchResponse.body.data.attributes.rules;
    if (typeof rules === 'string') {
      const normalized = rules.replace(/\s+/g, '');
      expect(normalized).toBe([1, 2]);
    } else {
      const nums = rules.map(r => typeof r === 'string' ? Number(r) : r);
      expect(nums).toEqual([1, 2]);
    }
  });
});
