import { test, expect } from '../../../../joomla-playwright/src/fixtures';

async function openVersionsDialog(page: import('@playwright/test').Page, joomla: any) {
  await page.goto('/administrator/index.php?option=com_content&task=article.add');
  await page.locator('#jform_title').fill('Test article versions');
  await joomla.clickToolbarButton('Save');
  await joomla.clickToolbarButton('Versions');
  const dialog = page.locator('joomla-dialog[type="iframe"]');
  await expect(dialog).toBeAttached();
  await expect(dialog).toHaveClass(/loaded/);
  await expect(dialog.locator('header.joomla-dialog-header')).toContainText('Versions');
  await expect(page.locator('joomla-dialog[type="iframe"] section.joomla-dialog-body iframe')).toHaveCount(1);
  return {
    dialog,
    frame: page.frameLocator('joomla-dialog[type="iframe"] section.joomla-dialog-body iframe'),
  };
}

async function expectFrameMessage(frame: ReturnType<import('@playwright/test').Page['frameLocator']>, text: string) {
  await expect(frame.locator('#system-message-container .alert-message').filter({ hasText: text })).toBeVisible();
}

test.describe('Test in backend that the content history list', () => {
  test.beforeEach(async ({ joomla }) => {
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'Test article versions'");
    await joomla.doAdministratorLogin();
  });

  test.afterEach(async ({ joomla }) => {
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'Test article versions'");
  });

  test('has a title', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill('Test article versions');
    await joomla.clickToolbarButton('Save');
    await joomla.clickToolbarButton('Versions');
    await expect(page.locator('.joomla-dialog-header')).toContainText('Versions');
  });

  test('can display a list of content history', async ({ page, joomla }) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    const { dialog, frame } = await openVersionsDialog(page, joomla);
    await expect(frame.locator('a').filter({ hasText: formattedDate }).first()).toHaveCount(1);
    await dialog.locator('header.joomla-dialog-header button.button-close.btn-close').click({ force: true });
    await expect(dialog).toHaveCount(0);
  });

  test('can open the history content item modal', async ({ page, joomla }) => {
    const { frame } = await openVersionsDialog(page, joomla);
    const previewUrl = await frame.locator('a').first().getAttribute('data-url');
    await page.goto(new URL(previewUrl as string, page.url()).href);
    await expect(page.locator('h1')).toContainText('Preview of version');
    await expect(page.getByText('Test article versions').first()).toBeVisible();
  });

  test('cannot compare one history content item only', async ({ page, joomla }) => {
    const { frame } = await openVersionsDialog(page, joomla);
    await frame.locator('thead input[name=\'checkall-toggle\']').click({ force: true });
    await expect(frame.locator('button.button-compare')).toContainText('Compare');
    await frame.locator('button.button-compare').click({ force: true });
    await expectFrameMessage(frame, 'Please select two versions.');
  });

  test('can delete a history content item', async ({ page, joomla }) => {
    const { frame } = await openVersionsDialog(page, joomla);
    await frame.locator('thead input[name=\'checkall-toggle\']').click({ force: true });
    await expect(frame.locator('button.button-delete')).toContainText('Delete');
    await frame.locator('button.button-delete').click({ force: true });
    await expectFrameMessage(frame, 'History version deleted.');
  });

  test('can keep on a history content item', async ({ page, joomla }) => {
    const { frame } = await openVersionsDialog(page, joomla);
    await frame.locator('thead input[name=\'checkall-toggle\']').click({ force: true });
    await expect(frame.locator('button.button-keep')).toContainText('Keep On/Off');
    await frame.locator('button.button-keep').click({ force: true });
    await expectFrameMessage(frame, 'Changed the keep forever value for a history version.');
  });

  test('can restore a history content item', async ({ page, joomla }) => {
    const { frame } = await openVersionsDialog(page, joomla);
    await frame.locator('thead input[name=\'checkall-toggle\']').click({ force: true });
    await expect(frame.locator('button.button-load')).toContainText('Restore');
    await frame.locator('button.button-load').click({ force: true });
    await expectFrameMessage(frame, 'Prior version restored.');
  });
});
