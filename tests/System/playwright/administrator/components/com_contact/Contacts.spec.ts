// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the contacts list', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
    await page.goto('/administrator/index.php?option=com_contact&view=contacts&filter=');
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    await expect(page.locator('h1.page-title')).toContainText('Contacts');
  });
  test('can display a list of contacts', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact'
    });
    await page.reload();
    await expect(page.getByText('Test contact').first()).toBeVisible();
  });
  test('can open the contact form', async ({
    page,
    joomla
  }) => {
    await joomla.clickToolbarButton('New');
    await expect(page.getByText('Contacts: New').first()).toBeVisible();
  });
  test('can publish the test contact', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact',
      published: 0
    });
    await page.reload();
    await joomla.searchForItem('Test contact');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Publish').first().click();
    await joomla.checkForSystemMessage('Contact published.');
  });
  test('can unpublish the test contact', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact',
      published: 1
    });
    await page.reload();
    await joomla.searchForItem('Test contact');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unpublish').first().click();
    await joomla.checkForSystemMessage('Contact unpublished.');
  });
  test('can feature the test contact', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact',
      featured: 0
    });
    await page.reload();
    await joomla.searchForItem('Test contact');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.locator('.button-featured').filter({
      hasText: 'Feature'
    }).click();
    await joomla.checkForSystemMessage('Contact featured.');
  });
  test('can unfeature the test contact', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact',
      featured: 1
    });
    await page.reload();
    await joomla.searchForItem('Test contact');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Unfeature').first().click();
    await joomla.checkForSystemMessage('Contact unfeatured.');
  });
  test('can trash the test contact', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact'
    });
    await page.reload();
    await joomla.searchForItem('Test contact');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('Action');
    await page.getByText('Trash').first().click();
    await joomla.checkForSystemMessage('Contact trashed.');
  });
  test('can delete the test contact', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact',
      published: -2
    });
    await page.reload();
    await joomla.setFilter('published', 'Trashed');
    await joomla.searchForItem('Test contact');
    await joomla.checkAllResults();
    await joomla.clickToolbarButton('empty trash');
    await joomla.clickDialogConfirm(true);
    await joomla.checkForSystemMessage('Contact deleted.');
  });
  test('can select contacts with multiselect', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'Test contact 1'
    });
    await joomla.db_createContact({
      name: 'Test contact 2'
    });
    await joomla.db_createContact({
      name: 'Test contact 3'
    });
    await joomla.db_createContact({
      name: 'Test contact 4'
    });
    await joomla.db_createContact({
      name: 'Test contact 5'
    });
    await page.reload();
    await joomla.searchForItem('Test contact');
    await page.locator('#cb1').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb3').click();
    await joomla.clickToolbarButton('Action');
    await joomla.clickToolbarButton('Unpublish');
    await joomla.checkForSystemMessage('3 contacts unpublished.');
    await expect(page.locator('thead input[name=\'checkall-toggle\']')).not.toBeChecked();
    await page.locator('#cb0').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb4').click();
    await expect(page.locator('thead input[name=\'checkall-toggle\']')).toBeChecked();
    await joomla.clickToolbarButton('Action');
    await joomla.clickToolbarButton('Unpublish');
    await joomla.checkForSystemMessage('2 contacts unpublished.');
    await joomla.checkAllResults();
    await page.locator('#cb2').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb4').click();
    await page.locator('body').fill('{shift}');
    await page.locator('#cb0').click();
    await joomla.clickToolbarButton('Action');
    await joomla.clickToolbarButton('Publish');
    await joomla.checkForSystemMessage('Contact published.');
  });
});
