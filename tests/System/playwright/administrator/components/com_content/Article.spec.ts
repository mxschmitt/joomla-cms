// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the article form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_content&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'Test article'");
  });
  test('can create an article', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await page.locator('#jform_title').fill("").fill('Test article');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Article saved.');
    await expect(page.getByText('Test article').first()).toBeVisible();
  });
  test('can change access level of a test article', async ({
    page,
    joomla
  }) => {
    const article = await joomla.db_createArticle({
      title: 'Test article'
    });
    await page.goto(`/administrator/index.php?option=com_content&task=article.edit&id=${article.id}`);
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
    await page.goto('/administrator/index.php?option=com_content&task=article.add');
    await joomla.clickToolbarButton('Cancel');
    await page.waitForResponse(resp => /index\.php\?option=com_content&view=articles/.test(resp.url()));
  });
});
