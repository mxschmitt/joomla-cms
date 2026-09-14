import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the Installer', () => {
  test.beforeEach(async ({ page, joomla }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_installer&view=languages');
  });

  test('has a title', async ({ page }) => {
    await expect(page.locator('h1.page-title')).toContainText('Extensions: Languages');
  });

  test('has any Language installable', async ({ page, joomla }) => {
    const table = page.locator('#installer-languages table');
    if (await table.count() === 0) {
      await expect(page.locator('#installer-languages .alert.alert-info')).toContainText('No Matching Results');
      await joomla.checkForSystemMessage("Can't connect to https://update.joomla.org/language/translationlist");
    } else {
      await expect(table.locator('input[type="button"]').first()).toHaveValue('Install');
      await expect(table.locator('a[target="_blank"]').first()).toHaveAttribute(
        'href',
        /^https:\/\/update\.joomla\.org\/language\/details/,
      );
    }
  });
});
