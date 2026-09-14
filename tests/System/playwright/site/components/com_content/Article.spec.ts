// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content article form', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__content where title = \'test article\'');
  });
  test('can edit an article in menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'automated test article',
      link: 'index.php?option=com_content&view=form&layout=edit'
    });
    await joomla.doFrontendLogin();
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test article'}).click();
    await page.locator('#jform_title').fill('test article');
    await page.locator('[data-submit-task="article.save"]').click();
    await expect(page.locator('.success')).toBeVisible();
    await expect(page.locator('[type="success"] > .alert-wrapper > .alert-message')).toContainText('Article submitted.');
  });
  test('can edit an article without menu item', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php?option=com_content&view=form&layout=edit');
    await page.locator('#jform_title').fill('test article');
    await page.locator('[data-submit-task="article.save"]').click();
    await expect(page.locator('.success')).toBeVisible();
    await expect(page.locator('[type="success"] > .alert-wrapper > .alert-message')).toContainText('Article submitted.');
  });
});
