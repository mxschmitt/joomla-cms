// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the field form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_fields&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__fields WHERE title = 'Test field'");
  });
  test('can create a field', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_fields&task=field.add&context=com_content.article');
    await page.locator('#jform_title').fill('Test field');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Field saved');
    await expect(page.getByText('Test field').filter({ visible: true }).first()).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_fields&task=field.add&context=com_content.article');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_fields&view=fields&context=com_content\.article/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
  test('can edit a field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createField({
      title: 'Test field'
    });
    await page.goto(`/administrator/index.php?option=com_fields&task=field.edit&id=${id}&context=com_content.article`);
    await page.locator('#jform_title').fill('Test field edited');
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.getByText('Test field edited').filter({ visible: true }).first()).toBeVisible();
  });
});
