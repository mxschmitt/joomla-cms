// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the contact category view', () => {
  test('can display a list of contacts in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'automated test contact 1',
      featured: 1
    });
    await joomla.db_createContact({
      name: 'automated test contact 2',
      featured: 1
    });
    await joomla.db_createContact({
      name: 'automated test contact 3',
      featured: 1
    });
    await joomla.db_createContact({
      name: 'automated test contact 4',
      featured: 1
    });
    await joomla.db_createMenuItem({
      title: 'automated test',
      link: 'index.php?option=com_contact&view=featured'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test' }).click();
    await expect(page.getByText('automated test contact 1').first()).toBeVisible();
    await expect(page.getByText('automated test contact 2').first()).toBeVisible();
    await expect(page.getByText('automated test contact 3').first()).toBeVisible();
    await expect(page.getByText('automated test contact 4').first()).toBeVisible();
  });
  test('can display a list of contacts without a menu item', async ({
    page,
    joomla
  }) => {
    let contact = await joomla.db_createContact({
      name: 'automated test contact 1'
    });
    contact = await joomla.db_createContact({
      name: 'automated test contact 2',
      featured: 1,
      catid: contact.catid
    });
    contact = await joomla.db_createContact({
      name: 'automated test contact 3',
      featured: 1,
      catid: contact.catid
    });
    contact = await joomla.db_createContact({
      name: 'automated test contact 4',
      featured: 1,
      catid: contact.catid
    });
    await page.goto(`/index.php?option=com_contact&view=category&id=${contact.catid}`);
    await expect(page.getByText('automated test contact 1').first()).toBeVisible();
    await expect(page.getByText('automated test contact 2').first()).toBeVisible();
    await expect(page.getByText('automated test contact 3').first()).toBeVisible();
    await expect(page.getByText('automated test contact 4').first()).toBeVisible();
  });
  test('can open the contact form in the default layout', async ({
    page,
    joomla
  }) => {
    const contact = await joomla.db_createContact({
      name: 'contact 1'
    });
    await joomla.db_createMenuItem({
      title: 'automated test',
      link: `index.php?option=com_contact&view=category&id=${contact.catid}`
    });
    await joomla.doFrontendLogin();
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test' }).click();
    await page.locator('a').filter({ hasText: 'New Contact' }).click();
    await expect(page.locator('#adminForm')).toBeVisible();
  });
});
