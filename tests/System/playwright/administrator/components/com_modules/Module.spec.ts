// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the module form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_modules&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__modules WHERE title = 'Test module'");
  });
  test('can create a module', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_modules&task=module.add&client_id=0&eid=44');
    await page.locator('#jform_title').fill('Test module');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Module saved');
    await expect(page.getByText('Test module').filter({ visible: true }).first()).toBeVisible();
  });
  test('can edit a module', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createModule({
      title: 'Test module',
      module: 'mod_custom'
    });
    await page.goto(`/administrator/index.php?option=com_modules&task=module.edit&id=${id}`);
    await page.locator('#jform_title').fill('Test module edited');
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.getByText('Test module edited').filter({ visible: true }).first()).toBeVisible();
  });
});
