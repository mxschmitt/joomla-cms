// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content category view', () => {
  ['default', 'blog'].forEach(layout => {
    test(`can display a list of articles in the ${layout} layout in a menu item`, async ({
      page,
      joomla
    }) => {
      let article = await joomla.db_createArticle({
        title: 'article 1'
      });
      article = await joomla.db_createArticle({
        title: 'article 2',
        catid: article.catid
      });
      article = await joomla.db_createArticle({
        title: 'article 3',
        catid: article.catid
      });
      article = await joomla.db_createArticle({
        title: 'article 4',
        catid: article.catid
      });
      await joomla.db_createMenuItem({
        title: 'automated test',
        alias: 'automated-test',
        link: `index.php?option=com_content&view=category&id=${article.catid}&layout=${layout}`,
        path: 'automated-test/root'
      });
      await page.goto('/');
      await page.locator('a').filter({ hasText: 'automated test' }).click();
      await expect(page.getByText('article 1').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('article 2').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('article 3').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('article 4').filter({ visible: true }).first()).toBeVisible();
    });
    test(`can display a list of articles in the ${layout} layout without a menu item`, async ({
      page,
      joomla
    }) => {
      let article = await joomla.db_createArticle({
        title: 'article 1'
      });
      article = await joomla.db_createArticle({
        title: 'article 2',
        catid: article.catid
      });
      article = await joomla.db_createArticle({
        title: 'article 3',
        catid: article.catid
      });
      article = await joomla.db_createArticle({
        title: 'article 4',
        catid: article.catid
      });
      await page.goto(`/index.php?option=com_content&view=category&id=${article.catid}&layout=${layout}`);
      await expect(page.getByText('article 1').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('article 2').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('article 3').filter({ visible: true }).first()).toBeVisible();
      await expect(page.getByText('article 4').filter({ visible: true }).first()).toBeVisible();
    });
  });
  test('can open the article form in the default layout', async ({
    page,
    joomla
  }) => {
    const article = await joomla.db_createArticle({
      title: 'article 1'
    });
    await joomla.db_createMenuItem({
      title: 'automated test',
      alias: 'automated-test',
      link: `index.php?option=com_content&view=category&id=${article.catid}&layout=default`,
      path: 'automated-test/root'
    });
    await joomla.doFrontendLogin();
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'automated test' }).click();
    await page.locator('a').filter({ hasText: 'New Article' }).click();
    await expect(page.locator('#adminForm')).toBeVisible();
  });
});
