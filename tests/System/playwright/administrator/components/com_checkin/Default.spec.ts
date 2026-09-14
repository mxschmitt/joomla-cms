// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the checkin', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_checkin');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Maintenance: Global Check-in');
  });
  test('can display message', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('p.lead')).toContainText('There are no tables with checked out items');
  });
  test('can display a list of checked out items', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      checked_out: '1',
      checked_out_time: '2024-01-01 20:00:00'
    });
    await page.goto('/administrator/index.php?option=com_checkin');
    await expect(page.locator('tr.row0')).toContainText('content');
  });
  test('can check in items', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'Test article',
      checked_out: '1',
      checked_out_time: '2024-01-01 20:00:00'
    });
    await page.goto('/administrator/index.php?option=com_checkin');
    await joomla.searchForItem('content');
    await joomla.checkAllResults();
    await page.locator('#toolbar-checkin').click();
    await joomla.checkForSystemMessage('Item checked in');
  });
});
