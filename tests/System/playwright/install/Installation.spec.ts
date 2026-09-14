import { test, expect } from '../../joomla-playwright/src/fixtures';

async function fillAdminStep(page: import('@playwright/test').Page, joomla: import('../../joomla-playwright/src/types').JoomlaHelpers, password: string) {
  await page.locator('#jform_site_name').fill(joomla.expose.sitename);
  await page.locator('#step1').click();
  await expect(page.locator('#jform_admin_password')).toBeVisible();
  await page.locator('#jform_admin_user').fill(joomla.expose.name);
  await page.locator('#jform_admin_username').fill(joomla.expose.username);
  await page.locator('#jform_admin_email').fill(joomla.expose.email);
  await page.locator('#jform_admin_password').click();
  await page.locator('#jform_admin_password').fill('');
  await page.locator('#jform_admin_password').pressSequentially(password, { delay: 15 });
  await page.locator('#jform_admin_password').blur();
}

test.describe('Install Joomla', () => {
  test.describe.configure({ timeout: 120_000 });

  test('blocks admin password with less than 12 characters', async ({ page, joomla }) => {
    await joomla.deleteRelativePath('configuration.php');
    await joomla.prepareInstaller();
    await fillAdminStep(page, joomla, 'Short1!');

    await expect(page.getByText("Password doesn't meet the site's requirements")).toBeVisible();
    await page.locator('#step2').click();
    await expect(page.locator('#installStep3')).toBeHidden();
  });

  test('allows admin password with 12 or more characters', async ({ page, joomla }) => {
    await joomla.deleteRelativePath('configuration.php');
    await joomla.prepareInstaller();
    await fillAdminStep(page, joomla, 'ValidPass123!');

    await expect(page.locator('#jform_admin_password')).toHaveValue('ValidPass123!');
    await page.locator('#step2').click();
    await expect(page.locator('#installStep3')).toBeVisible();
  });

  test('blocks admin password with spaces at the beginning', async ({ page, joomla }) => {
    await joomla.deleteRelativePath('configuration.php');
    await joomla.prepareInstaller();
    await fillAdminStep(page, joomla, ' ValidPass123!');

    await expect(page.getByText('Password must not have spaces at the beginning or end')).toBeVisible();
    await page.locator('#step2').click();
    await expect(page.locator('#installStep3')).toBeHidden();
  });

  test('blocks admin password with spaces at the end', async ({ page, joomla }) => {
    await joomla.deleteRelativePath('configuration.php');
    await joomla.prepareInstaller();
    await fillAdminStep(page, joomla, 'ValidPass123! ');

    await expect(page.getByText('Password must not have spaces at the beginning or end')).toBeVisible();
    await page.locator('#step2').click();
    await expect(page.locator('#installStep3')).toBeHidden();
  });

  test('allows spaces in the middle of admin_password', async ({ page, joomla }) => {
    await joomla.deleteRelativePath('configuration.php');
    await joomla.prepareInstaller();
    await fillAdminStep(page, joomla, 'Valid Pass 123!');

    await expect(page.locator('#jform_admin_password')).toHaveValue('Valid Pass 123!');
    await page.locator('#step2').click();
    await expect(page.locator('#installStep3')).toBeVisible();
  });

  test('Install Joomla', async ({ page, joomla }) => {
    const config = { ...joomla.expose };

    await joomla.deleteRelativePath('configuration.php');
    await joomla.installJoomla(config);
    await joomla.db_enableExtension(0, 'plg_behaviour_compat7');
    await joomla.doAdministratorLogin(config.username, config.password, false);
    await joomla.cancelTour();
    await joomla.disableStatistics();
    await joomla.setErrorReportingToDevelopment();
    await joomla.doAdministratorLogout();
    await joomla.config_setParameter('mailonline', true);
    await joomla.config_setParameter('mailer', 'smtp');
    await joomla.config_setParameter('smtphost', joomla.expose.smtp_host);
    await joomla.config_setParameter('smtpport', joomla.expose.smtp_port);
  });
});
