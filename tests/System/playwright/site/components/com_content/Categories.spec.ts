// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content categories view', () => {
  test('can display a list of categories without a menu item', async ({
    page,
    joomla
  }) => {
    let id = await joomla.db_createCategory({
      title: 'automated test category 1',
      extension: 'com_content'
    });
    await joomla.db_createArticle({
      title: 'automated test article 1',
      catid: id
    });
    id = await joomla.db_createCategory({
      title: 'automated test category 2',
      extension: 'com_content'
    });
    await joomla.db_createArticle({
      title: 'automated test article 2',
      catid: id
    });
    await joomla.db_createArticle({
      title: 'automated test article 3',
      catid: id
    });
    await page.goto('/index.php?option=com_content&view=categories');
    await expect(page.getByText('automated test category 1').first()).toBeVisible();
    await expect(page.locator(':nth-child(1) > .com-content-categories__item-title-wrapper > .com-content-categories__item-title > .badge').filter({
      hasText: 'Article Count: 1'
    })).toBeVisible();
    await expect(page.getByText('automated test category 2').first()).toBeVisible();
    await expect(page.locator(':nth-child(2) > .com-content-categories__item-title-wrapper > .com-content-categories__item-title > .badge').filter({
      hasText: 'Article Count: 2'
    })).toBeVisible();
  });
  test('can display a list of categories in a menu item', async ({
    page,
    joomla
  }) => {
    let id = await joomla.db_createCategory({
      title: 'automated test category 1',
      extension: 'com_content'
    });
    await joomla.db_createArticle({
      title: 'automated test article 1',
      catid: id
    });
    id = await joomla.db_createCategory({
      title: 'automated test category 2',
      extension: 'com_content'
    });
    await joomla.db_createArticle({
      title: 'automated test article 2',
      catid: id
    });
    await joomla.db_createArticle({
      title: 'automated test article 3',
      catid: id
    });
    await joomla.db_createMenuItem({
      title: 'automated test categories',
      link: 'index.php?option=com_content&view=categories'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test categories' }).click();
    await expect(page.getByText('automated test category 1').first()).toBeVisible();
    await expect(page.locator(':nth-child(1) > .com-content-categories__item-title-wrapper > .com-content-categories__item-title > .badge').filter({
      hasText: 'Article Count: 1'
    })).toBeVisible();
    await expect(page.getByText('automated test category 2').first()).toBeVisible();
    await expect(page.locator(':nth-child(2) > .com-content-categories__item-title-wrapper > .com-content-categories__item-title > .badge').filter({
      hasText: 'Article Count: 2'
    })).toBeVisible();
  });
});
