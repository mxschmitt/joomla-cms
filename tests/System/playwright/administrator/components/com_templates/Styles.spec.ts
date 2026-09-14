// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the styles list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
  });
  test('can list site styles', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=styles&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Site)');
    await expect(page.locator('#client_id option:checked')).toHaveText('Site');
    await page.locator('#styleList tbody a').filter({
      hasText: 'Cassiopeia - Default'
    }).click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Edit Style');
    await joomla.clickToolbarButton('Cancel');
  });
  test('can list administrator styles', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=styles&client_id=1');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Administrator)');
    await expect(page.locator('#client_id option:checked')).toHaveText('Administrator');
    await page.locator('#styleList tbody a').filter({
      hasText: 'Atum - Default'
    }).click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Edit Style');
    await joomla.clickToolbarButton('Cancel');
  });
  test('can select client', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=styles&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Site)');
    await page.locator('#client_id').selectOption({
      label: 'Administrator'
    });
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Administrator)');
    await page.locator('#client_id').selectOption({
      label: 'Site'
    });
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Site)');
  });
  test('can open templates', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=styles&client_id=1');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Administrator)');
    await page.locator('#toolbar-templates').click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Administrator)');
  });
  test('can open options', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=styles&client_id=0');
    let __wait = page.waitForResponse(resp => /.*.*\/administrator\/index\.php\?option=com_config&view=component&component=com_templates.*/.test(resp.url()));
    await joomla.clickToolbarButton('Options');
    await __wait;
    expect(await page.title()).toContain('Template: Options');
    await expect(page.locator('h1.page-title')).toContainText('Template: Options');
    __wait = page.waitForResponse(resp => /.*.*\/administrator\/index\.php\?option=com_templates&view=styles&client_id=0.*/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
});
