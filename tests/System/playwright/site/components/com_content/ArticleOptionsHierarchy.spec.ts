// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content article view', () => {
  // Which options win when an article is displayed depends on HOW the article is
  // reached (see components/com_content/src/View/Article/HtmlView.php::display):
  //   - Reached through its OWN single article menu item  -> the menu item
  //     options take priority over the article options.
  //   - Reached any other way (a category/blog menu, another menu item, or a
  //     direct link with no matching menu item) -> the article options take
  //     priority over the menu item options.
  // On top of that the model resolves a menu option set to 'use_article' to the
  // article option, falling back to the global option when the article is set to
  // "Use Global".
  //
  // We use show_create_date as the representative option: it renders
  // <dd class="create">Created: ...</dd> whenever it evaluates to true, and is
  // gated only by the option itself (no user/category data required).

  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_deleteMenuItem({
      title: 'automated test blog menu'
    });
    await joomla.db_deleteMenuItem({
      title: 'automated test article menu'
    });
    await joomla.queryDB("DELETE FROM #__content WHERE title = 'test article'");
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
  });
  test("shows the create date when a category blog menu resolves a 'use_article' option to the article option", async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '0', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '1'
      })
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test blog menu',
      alias: 'automated-test-blog-menu',
      link: `index.php?option=com_content&view=category&layout=blog&id=${article.catid}`,
      path: 'automated-test-blog-menu',
      params: JSON.stringify({
        show_create_date: 'use_article'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toBeVisible();
  });
  test("hides the create date when a category blog menu resolves a 'use_article' option to the article option", async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '0'
      })
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test blog menu',
      alias: 'automated-test-blog-menu',
      link: `index.php?option=com_content&view=category&layout=blog&id=${article.catid}`,
      path: 'automated-test-blog-menu',
      params: JSON.stringify({
        show_create_date: 'use_article'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
  test("shows the create date when a category blog menu 'use_article' option falls back to the global option for a Use Global article", async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: ''
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test blog menu',
      alias: 'automated-test-blog-menu',
      link: `index.php?option=com_content&view=category&layout=blog&id=${article.catid}`,
      path: 'automated-test-blog-menu',
      params: JSON.stringify({
        show_create_date: 'use_article'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toBeVisible();
  });
  test("hides the create date when a category blog menu 'use_article' option falls back to the global option for a Use Global article", async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '0', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: ''
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test blog menu',
      alias: 'automated-test-blog-menu',
      link: `index.php?option=com_content&view=category&layout=blog&id=${article.catid}`,
      path: 'automated-test-blog-menu',
      params: JSON.stringify({
        show_create_date: 'use_article'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
  test('applies the article option through a category blog menu even when the menu leaves it as Use Global (regression #48058)', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '0'
      })
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test blog menu',
      alias: 'automated-test-blog-menu',
      link: `index.php?option=com_content&view=category&layout=blog&id=${article.catid}`,
      path: 'automated-test-blog-menu',
      params: ''
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
  test('applies the article option over the global one on direct access (hide)', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '0'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
  test('applies the article option over the global one on direct access (show)', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '0', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '1'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`);
    await expect(page.locator('.create')).toBeVisible();
  });
  test('honours the global option on direct access when the article is Use Global', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '0', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: ''
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
  test('lets a single article menu item override the article option (hide)', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '1'
      })
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test article menu',
      alias: 'automated-test-article-menu',
      link: `index.php?option=com_content&view=article&id=${article.id}`,
      path: 'automated-test-article-menu',
      params: JSON.stringify({
        show_create_date: '0'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
  test('lets a single article menu item override the article option (show)', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '0', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: JSON.stringify({
        show_create_date: '0'
      })
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test article menu',
      alias: 'automated-test-article-menu',
      link: `index.php?option=com_content&view=article&id=${article.id}`,
      path: 'automated-test-article-menu',
      params: JSON.stringify({
        show_create_date: '1'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toBeVisible();
  });
  test('lets a single article menu item override the global option when the article is Use Global (hide)', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('show_create_date', '1', 'com_content');
    const article = await joomla.db_createArticle({
      attribs: ''
    });
    const menuId = await joomla.db_createMenuItem({
      title: 'automated test article menu',
      alias: 'automated-test-article-menu',
      link: `index.php?option=com_content&view=article&id=${article.id}`,
      path: 'automated-test-article-menu',
      params: JSON.stringify({
        show_create_date: '0'
      })
    });
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}&Itemid=${menuId}`);
    await expect(page.locator('.create')).toHaveCount(0);
  });
});
