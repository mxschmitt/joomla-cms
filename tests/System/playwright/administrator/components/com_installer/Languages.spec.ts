// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the Installer', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_installer&view=languages');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Extensions: Languages');
  });
  test('has any Language installable', async ({
    page,
    joomla
  }) => {
    const body = page.locator('body');
    if (body.find('#installer-languages table').length === 0) {
      await expect(page.locator('#installer-languages .alert.alert-info')).toContainText('No Matching Results');
      await joomla.checkForSystemMessage('Can\'t connect to https://update.joomla.org/language/translationlist');
    } else {
      await expect(page.locator('#installer-languages table')).toBeVisible();
    }
  });
});
