// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the tag form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_tags&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__tags WHERE title = 'Test tag'");
  });
  test('can create a tag', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_tags&task=tag.add');
    await page.locator('#jform_title').fill('Test tag');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Tag saved');
    await expect(page.getByText('Test tag')).toBeVisible();
  });
  test('can edit a tag', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createTag({
      title: 'Test tag'
    });
    await page.goto(`/administrator/index.php?option=com_tags&task=tag.edit&id=${id}`);
    await page.locator('#jform_title').fill('Test tag edited');
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.getByText('Test tag edited')).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_tags&task=tag.add');
    await joomla.clickToolbarButton('Cancel');
    await page.waitForResponse(resp => /index\.php\?option=com_tags&view=tags/.test(resp.url()));
  });
});
