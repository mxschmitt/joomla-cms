// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content site router', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('sef_ids', '1', 'com_content');
  });
  test('can process article without a menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/component/content/article/test-content-router';
    const article = await joomla.db_createArticle({
      title: 'Test Article',
      alias: 'test-content-router'
    });
    let response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}`,
      followRedirect: false
    });
    expect(response.status).toBe(200);
    // @TODO: Not working if 'Featured Articles' is home menu item
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}-${article.alias}`,
      followRedirect: false
    });
    expect(response.status).toBe(200);
    // @TODO: Not working if 'Featured Articles' is home menu item
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Article');
    await expect(page.locator('main h1').filter({
      hasText: 'Home'
    })).toBeVisible();
    await expect(page.locator('main h2').filter({
      hasText: 'Test Article'
    })).toBeVisible();
    const breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(4);
    await expect(breadcrumb.nth(2)).toContainText('Uncategorised');
    await expect(breadcrumb.nth(3)).toContainText('Test Article');
  });
  test('can process article with a single article menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/test-menu-article-router';
    const article = await joomla.db_createArticle({
      title: 'Test Article',
      alias: 'test-content-router'
    });
    await joomla.db_createMenuItem({
      title: 'Test Menu Single Article',
      alias: 'test-menu-article-router',
      path: 'test-menu-article-router',
      link: `index.php?option=com_content&view=article&id=${article.id}`
    });
    let response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}-${article.alias}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}-${article.alias}&catid=${article.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Article');
    await expect(page.locator('main h1').filter({
      hasText: 'Test Article'
    })).toBeVisible();
    const breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(3);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Single Article');
  });
  test('can process article with a category list menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/test-menu-category-router/test-content-router';
    const article = await joomla.db_createArticle({
      title: 'Test Article',
      alias: 'test-content-router'
    });
    await joomla.db_createMenuItem({
      title: 'Test Menu Article Category',
      alias: 'test-menu-category-router',
      path: 'test-menu-category-router',
      link: `index.php?option=com_content&view=category&id=${article.catid}`
    });
    let response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}-${article.alias}&catid=${article.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url.split('/').slice(0, -1).join('/'));
    expect(page.url()).toMatch(new RegExp(`${url.split('/').slice(0, -1).join('/')}$`));
    expect(await page.title()).toBe('Test Menu Article Category');
    await expect(page.locator('main h1')).toHaveCount(0);
    let breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(3);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Article Category');
    expect(await page.locator('main div.com-content-category a').filter({
      hasText: 'Test Article'
    }).getAttribute('href')).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Article');
    await expect(page.locator('main h1').filter({
      hasText: 'Test Article'
    })).toBeVisible();
    breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(4);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Article Category');
    await expect(breadcrumb.nth(3)).toContainText('Test Article');
  });
  test('can process article with a categories list menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/test-menu-categories-router/uncategorised/test-content-router';
    const article = await joomla.db_createArticle({
      title: 'Test Article',
      alias: 'test-content-router'
    });
    await joomla.db_createMenuItem({
      title: 'Test Menu Article Categories',
      alias: 'test-menu-categories-router',
      path: 'test-menu-categories-router',
      link: 'index.php?option=com_content&view=categories&id=0'
    });
    const response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url.split('/').slice(0, -2).join('/'));
    expect(page.url()).toMatch(new RegExp(`${url.split('/').slice(0, -2).join('/')}$`));
    expect(await page.title()).toBe('Test Menu Article Categories');
    let breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(3);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Article Categories');
    expect(await page.locator('main div.com-content-categories div a').filter({
      hasText: 'Uncategorised'
    }).getAttribute('href')).toMatch(new RegExp(`${url.split('/').slice(0, -1).join('/')}$`));
    await page.goto(`${url.split('/').slice(0, -1).join('/')}`);
    expect(page.url()).toMatch(new RegExp(`${url.split('/').slice(0, -1).join('/')}$`));
    expect(await page.title()).toBe('Uncategorised');
    await expect(page.locator('main h1')).toHaveCount(0);
    breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(4);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Article Categories');
    await expect(breadcrumb.nth(3)).toContainText('Uncategorised');
    expect(await page.locator('main div.com-content-category-blog h2 a').filter({
      hasText: 'Test Article'
    }).getAttribute('href')).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Article');
    await expect(page.locator('main h1').filter({
      hasText: 'Test Article'
    })).toBeVisible();
    breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(5);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Article Categories');
    await expect(breadcrumb.nth(3)).toContainText('Uncategorised');
    await expect(breadcrumb.nth(4)).toContainText('Test Article');
  });
  test('can process article with legacy routing', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('sef_ids', '0', 'com_content');
    const article = await joomla.db_createArticle({
      title: 'Test Article',
      alias: 'test-content-router'
    });
    const url = `/index.php/component/content/article/${article.id}-test-content-router`;
    let response = await joomla.http({
      url,
      followRedirect: false
    });
    expect(response.status).toBe(200);
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}`,
      followRedirect: false
    });
    expect(response.status).toBe(200);
    // @TODO: Not working if 'Featured Articles' is home menu item
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_content&view=article&id=${article.id}-${article.alias}`,
      followRedirect: false
    });
    expect(response.status).toBe(200);
    // @TODO: Not working if 'Featured Articles' is home menu item
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
  });
});
