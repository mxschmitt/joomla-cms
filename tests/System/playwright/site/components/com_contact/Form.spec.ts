// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the contact form view', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__contact_details');
  });
  test('can create a contact through a form', async ({
    page,
    joomla
  }) => {
    await joomla.doFrontendLogin();
    await page.goto('/index.php?option=com_contact&view=form&layout=edit');
    await page.locator('#jform_name').fill('test contact 1');
    await page.locator('.mb-2 > .btn-primary').click();
    const id = await joomla.queryDB('SELECT catid FROM #__contact_details WHERE name = \'test contact 1\'');
    await page.goto(`/index.php?option=com_contact&view=category&id=${id[0].catid}`);
    await expect(page.getByText('test contact 1').filter({ visible: true }).first()).toBeVisible();
  });
  test('can send an email on contact form submission ', async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
    const id = await joomla.db_getUserId();
    const contact = await joomla.db_createContact({
      name: 'test contact',
      user_id: id
    });
    await page.goto(`/index.php?option=com_contact&view=contact&id=${contact.id}`);
    await page.locator('#jform_contact_name').fill('Test User');
    await page.locator('#jform_contact_email').fill('testuser@example.com');
    await page.locator('#jform_contact_emailmsg').fill('Test Subject');
    await page.locator('#jform_contact_message').fill('Test message content');
    await page.locator('button.btn.btn-primary.validate[type="submit"]').click();
    const mails = await joomla.getMails();
    expect(mails.length).to.be.greaterThan(0);
    await expect(mails[0].body).toContain('Test message content');
  });
});
