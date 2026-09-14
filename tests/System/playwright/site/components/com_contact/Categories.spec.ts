// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the contact categories view', () => {
  test('can display a list of contact categories without a menu item', async ({
    page,
    joomla
  }) => {
    let id = await joomla.db_createCategory({
      title: 'automated test category 1',
      extension: 'com_contact'
    });
    await joomla.db_createContact({
      name: 'automated test contact 1',
      catid: id
    });
    id = await joomla.db_createCategory({
      title: 'automated test category 2',
      extension: 'com_contact'
    });
    await joomla.db_createContact({
      name: 'automated test contact 2',
      catid: id
    });
    await joomla.db_createContact({
      name: 'automated test contact 3',
      catid: id
    });
    await page.goto('/index.php?option=com_contact&view=categories');
    await expect(page.getByText('automated test category 1').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test category 2').filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator(':nth-child(2) > .page-header > .badge').filter({
      hasText: 'Contact Count: 1'
    })).toBeVisible();
    await expect(page.locator(':nth-child(3) > .page-header > .badge').filter({
      hasText: 'Contact Count: 2'
    })).toBeVisible();
  });
  test('can display a list of categories in a menu item', async ({
    page,
    joomla
  }) => {
    let id = await joomla.db_createCategory({
      title: 'automated test category 1',
      extension: 'com_contact'
    });
    await joomla.db_createContact({
      name: 'automated test contact 1',
      catid: id
    });
    id = await joomla.db_createCategory({
      title: 'automated test category 2',
      extension: 'com_contact'
    });
    await joomla.db_createContact({
      name: 'automated test contact 2',
      catid: id
    });
    await joomla.db_createContact({
      name: 'automated test contact 3',
      catid: id
    });
    await joomla.db_createMenuItem({
      title: 'automated test categories',
      link: 'index.php?option=com_contact&view=categories'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test categories' }).click();
    await expect(page.getByText('automated test category 1').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test category 2').filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator(':nth-child(1) > .page-header > .badge').filter({
      hasText: 'Contact Count: 1'
    })).toBeVisible();
    await expect(page.locator(':nth-child(2) > .page-header > .badge').filter({
      hasText: 'Contact Count: 2'
    })).toBeVisible();
  });
});
