// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the content history list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'Test article versions'");
    await joomla.doAdministratorLogin();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'Test article versions'");
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    await expect(page.locator('.joomla-dialog-header')).toContainText('Versions');
  });
  test('can display a list of content history', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const dialogContent = page.locator('joomla-dialog[type="iframe"]');
    await expect(dialogContent).toBeVisible();
    dialogContent;
    await expect(dialogContent).toHaveCount(0);
  });
  test('can open the history content item modal', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    const dialogContent = page.locator('joomla-dialog[type="iframe"]');
    await expect(dialogContent).toBeVisible();
    dialogContent;
    await expect(page.locator('h1')).toContainText('Preview of version');
    await expect(page.getByText('Test article versions')).toBeVisible();
  });
  test('cannot compare one history content item only', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    const dialogContent = page.locator('joomla-dialog[type="iframe"]');
    await expect(dialogContent).toBeVisible();
    dialogContent;
  });
  test('can delete a history content item', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    const dialogContent = page.locator('joomla-dialog[type="iframe"]');
    await expect(dialogContent).toBeVisible();
    dialogContent;
  });
  test('can keep on a history content item', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    const dialogContent = page.locator('joomla-dialog[type="iframe"]');
    await expect(dialogContent).toBeVisible();
    dialogContent;
  });
  test('can restore a history content item', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    const dialogContent = page.locator('joomla-dialog[type="iframe"]');
    await expect(dialogContent).toBeVisible();
    dialogContent;
  });
});
