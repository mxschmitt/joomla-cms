// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the tags tag view', () => {
  test('can display a list of tags in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'automated test tag 1'
    });
    await joomla.db_createTag({
      title: 'automated test tag 2'
    });
    await joomla.db_createTag({
      title: 'automated test tag 3'
    });
    await joomla.db_createTag({
      title: 'automated test tag 4'
    });
    await joomla.db_createMenuItem({
      title: 'automated test tags',
      link: 'index.php?option=com_tags&view=tags'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test tags' }).click();
    await expect(page.getByText('automated test tag 1').first()).toBeVisible();
    await expect(page.getByText('automated test tag 2').first()).toBeVisible();
    await expect(page.getByText('automated test tag 3').first()).toBeVisible();
    await expect(page.getByText('automated test tag 4').first()).toBeVisible();
  });
  test('can display a list of tags without a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createTag({
      title: 'automated test tag 1'
    });
    await joomla.db_createTag({
      title: 'automated test tag 2'
    });
    await joomla.db_createTag({
      title: 'automated test tag 3'
    });
    await joomla.db_createTag({
      title: 'automated test tag 4'
    });
    await page.goto('/index.php?option=com_tags&view=tags');
    await expect(page.getByText('automated test tag 1').first()).toBeVisible();
    await expect(page.getByText('automated test tag 2').first()).toBeVisible();
    await expect(page.getByText('automated test tag 3').first()).toBeVisible();
    await expect(page.getByText('automated test tag 4').first()).toBeVisible();
  });
});
