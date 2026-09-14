// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the contact details view', () => {
  test('can display a form', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_getUserId();
    const contact = await joomla.db_createContact({
      name: 'contact 1',
      user_id: id
    });
    await page.goto(`/index.php?option=com_contact&view=contact&id=${contact.id}`);
    await expect(page.getByText('Contact Form').first()).toBeVisible();
    await expect(page.locator('.m-0')).toBeVisible();
  });
  test('can display a custom field', async ({
    page,
    joomla
  }) => {
    const id = await joomla.db_createFieldGroup({
      title: 'automated test_field group',
      context: 'com_contact.mail'
    });
    await joomla.db_createField({
      group_id: id,
      context: 'com_contact.mail',
      type: 'checkboxes',
      fieldparams: JSON.stringify({
        options: {
          options0: {
            name: 'test value',
            value: ''
          }
        }
      })
    });
    const userId = await joomla.db_getUserId();
    const contact = await joomla.db_createContact({
      name: 'automated test contact 1',
      user_id: userId
    });
    await page.goto(`/index.php?option=com_contact&view=contact&id=${contact.id}`);
    await expect(page.getByText('automated test_field group').first()).toBeVisible();
    await expect(page.getByText('test field').first()).toBeVisible();
    await expect(page.getByText('test value').first()).toBeVisible();
  });
});
