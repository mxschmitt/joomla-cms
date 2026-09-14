// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the templates list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
  });
  test('can list site templates', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
    await expect(page.locator('#client_id option:checked')).toHaveText('Site');
    await page.locator('#templateList tbody .template-name a').filter({
      hasText: 'Cassiopeia'
    }).click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Customise (Cassiopeia)');
    await joomla.clickToolbarButton('Cancel');
  });
  test('can list administrator templates', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=1');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Administrator)');
    await expect(page.locator('#client_id option:checked')).toHaveText('Administrator');
    await page.locator('#templateList tbody .template-name a').filter({
      hasText: 'Atum'
    }).click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Customise (Atum)');
    await joomla.clickToolbarButton('Cancel');
  });
  test('can select client', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
    await page.locator('#client_id').selectOption({
      label: 'Administrator'
    });
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Administrator)');
    await page.locator('#client_id').selectOption({
      label: 'Site'
    });
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
  });
  test('can open styles', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=0');
    await expect(page.locator('h1.page-title')).toContainText('Templates: Templates (Site)');
    await page.locator('#toolbar-styles').click();
    await expect(page.locator('h1.page-title')).toContainText('Templates: Styles (Site)');
  });
  test('can open options', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_templates&view=templates&client_id=1');
    let __wait = page.waitForResponse(resp => /.*.*\/administrator\/index\.php\?option=com_config&view=component&component=com_templates.*/.test(resp.url()));
    await joomla.clickToolbarButton('Options');
    await __wait;
    expect(await page.title()).toContain('Template: Options');
    await expect(page.locator('h1.page-title')).toContainText('Template: Options');
    __wait = page.waitForResponse(resp => /.*.*\/administrator\/index\.php\?option=com_templates&view=templates&client_id=1.*/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
});
