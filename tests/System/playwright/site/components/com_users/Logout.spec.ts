// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the users logout view', () => {
  test('can log out the user without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin(null, null, false);
    await page.goto('/index.php?option=com_users&view=login&layout=logout&task=user.menulogout');
    await expect(page.getByText(`Hi ${joomla.expose.name}`).filter({ visible: true }).first()).toHaveCount(0);
  });
  test('can log out the user in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Automated logout',
      link: 'index.php?option=com_users&view=login&layout=logout&task=user.menulogout'
    });
    await joomla.doFrontendLogin(null, null, false);
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated logout' }).click();
    await expect(page.getByText(`Hi ${joomla.expose.name}`).filter({ visible: true }).first()).toHaveCount(0);
    await joomla.checkForSystemMessage('You have been logged out.');
  });
});
