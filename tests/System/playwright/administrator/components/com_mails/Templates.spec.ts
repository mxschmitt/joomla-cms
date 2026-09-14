// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the mails', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_mails&view=templates');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Mail Templates');
  });
  test('can display a list of mail templates', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('tr.row0')).toContainText('User Actions Log');
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_mails&task=template.edit&template_id=com_actionlogs.notification&language=en-GB');
    await joomla.clickToolbarButton('Cancel');
    await page.waitForResponse(resp => /index\.php\?option=com_mails&view=templates/.test(resp.url()));
  });
});
