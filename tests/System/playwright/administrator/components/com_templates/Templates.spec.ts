import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the templates list', () => {
  test.beforeEach(async ({ joomla }) => {
    await joomla.doAdministratorLogin();
  });

  test('can list site templates', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
    await expect(page.locator('#client_id option:checked')).toHaveText('Site');
    await page.locator('#templateList tbody .template-name a').filter({ hasText: 'Cassiopeia' }).first().click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Customise (Cassiopeia)');
    await joomla.clickToolbarButton('Cancel');
  });

  test('can list administrator templates', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=1');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Administrator)');
    await expect(page.locator('#client_id option:checked')).toHaveText('Administrator');
    await page.locator('#templateList tbody .template-name a').filter({ hasText: 'Atum' }).first().click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Customise (Atum)');
    await joomla.clickToolbarButton('Cancel');
  });

  test('can select client', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
    await page.locator('#client_id').selectOption('Administrator');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Administrator)');
    await page.locator('#client_id').selectOption('Site');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
  });

  test('can open styles', async ({ page }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
    await page.locator('#toolbar-styles').click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Site)');
  });

  test('can open options', async ({ page, joomla }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=1');
    const waitOptions = page.waitForResponse((resp) => /option=com_config&view=component&component=com_templates/.test(resp.url()));
    await joomla.clickToolbarButton('Options');
    await waitOptions;
    expect(await page.title()).toContain('Template: Options');
    await expect(page.locator('h1.page-title')).toContainText('Template: Options');
    const waitList = page.waitForResponse((resp) => /option=com_templates&view=templates&client_id=1/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await waitList;
  });
});
