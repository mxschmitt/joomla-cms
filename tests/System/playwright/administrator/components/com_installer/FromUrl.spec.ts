// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the Installer', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_installer&view=install');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Extensions: Install');
  });
  test('can install and uninstall a component from URL tab', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('joomla-tab-element#url')).toBeVisible();
    await page.locator('joomla-tab-element#url').click({
      force: true
    });
    await expect(page.locator('button#installbutton_url')).toContainText('Check & Install');
    await page.locator('input#install_url').fill('https://github.com/joomla-extensions/patchtester/releases/download/4.4.0/com_patchtester_4.4.0.zip');
    await page.locator('button#installbutton_url').click({
      force: true
    });
    await expect(page.getByText('Installation of the component was successful.').filter({ visible: true }).first()).toBeVisible();
    await page.goto('/administrator/index.php?option=com_installer&view=manage');
    await joomla.searchForItem('Joomla! Patch Tester');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Uninstall').filter({ visible: true }).first().click();
    await joomla.clickDialogConfirm(true);
    await expect(page.getByText('Uninstalling the component com_patchtester was successful.').filter({ visible: true }).first()).toBeVisible();
  });
});
