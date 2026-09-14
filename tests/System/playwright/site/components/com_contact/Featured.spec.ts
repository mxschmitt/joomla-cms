// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the contact featured view', () => {
  test('can display featured contacts', async ({
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
    await expect(page.getByText('automated test contact 1').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test contact 2').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test contact 3').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('automated test contact 4').filter({ visible: true }).first()).toBeVisible();
  });
  test('can not display not featured contacts', async ({
    page,
    joomla
  }) => {
    await joomla.db_createContact({
      name: 'automated test contact 1',
      featured: 0
    });
    await joomla.db_createContact({
      name: 'automated test contact 2',
      featured: 0
    });
    await joomla.db_createMenuItem({
      title: 'automated test',
      link: 'index.php?option=com_contact&view=featured'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test' }).click();
    await expect(page.getByText('automated test contact 1').filter({ visible: true }).first()).toHaveCount(0);
    await expect(page.getByText('automated test contact 2').filter({ visible: true }).first()).toHaveCount(0);
  });
});
