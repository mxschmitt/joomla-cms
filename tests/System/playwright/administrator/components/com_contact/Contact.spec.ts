// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the contact form', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_contact&filter=');
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__contact_details WHERE name = 'Test contact'");
  });
  test('can create a contact', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_contact&task=contact.add');
    await page.locator('#jform_name').fill('Test contact');
    await joomla.clickToolbarButton('Save & Close');
    await joomla.checkForSystemMessage('Contact saved.');
    await expect(page.getByText('Test contact').first()).toBeVisible();
  });
  test('can change access level of a test contact', async ({
    page,
    joomla
  }) => {
    const contact = await joomla.db_createContact({
      name: 'Test contact'
    });
    await page.goto(`/administrator/index.php?option=com_contact&task=contact.edit&id=${contact.id}`);
    await page.locator('#jform_access').selectOption({
      label: 'Special'
    });
    await joomla.clickToolbarButton('Save & Close');
    await expect(page.locator('td').filter({
      hasText: 'Special'
    })).toBeVisible();
  });
  test('check redirection to list view', async ({
    page,
    joomla
  }) => {
    await page.goto('/administrator/index.php?option=com_contact&task=contact.add');
    const __wait = page.waitForResponse(resp => /index\.php\?option=com_contact&view=contacts/.test(resp.url()));
    await joomla.clickToolbarButton('Cancel');
    await __wait;
  });
});
