// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the category form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_categories&extension=com_content&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteCategory({
      title: 'Test category'
    });
  });
  test('can create a category', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_categories&task=category.add&extension=com_content');
    await expect(page.locator('#jform_title')).toBeVisible();
    await page.locator('#jform_title').fill('Test category');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Category saved.');
    await expect(page.getByText('Test category').first()).toBeVisible();
  });
  test('can change access level of a test category', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createCategory({
      title: 'Test category'
    });
    await page.goto(`/administrator/index.php?option=com_categories&task=category.edit&id=${id}&extension=com_content`);
    await page.locator('#jform_access').selectOption({
      label: 'Special'
    });
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.locator('td').filter({
      hasText: 'Special'
    })).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_categories&task=category.add&extension=com_content&filter[published]=');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_categories&view=categories&extension=com_content/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
});
