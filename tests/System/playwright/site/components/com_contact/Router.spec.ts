// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the contact site router', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('sef_ids', '1', 'com_contact');
  });
  test('can process contact without a menu item', async ({
    page,
    joomla
  }) => {
    const contact = await joomla.db_createContact({
      name: 'Test Contact',
      alias: 'test-contact-router'
    });
    const url = '/index.php/component/contact/contact/test-contact-router';
    let response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}`,
      followRedirect: false
    });
    // @TODO: The following line is just a temporary fix. Remove it and uncomment the 2 lines after it when done.
    expect(response.status).toBe(200);
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}-${contact.alias}`,
      followRedirect: false
    });
    // @TODO: The following line is just a temporary fix. Remove it and uncomment the 2 lines after it when done.
    expect(response.status).toBe(200);
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Contact');
    await expect(page.locator('main h1').filter({
      hasText: 'Home'
    })).toBeVisible();
    await expect(page.locator('main h2').filter({
      hasText: 'Test Contact'
    })).toBeVisible();
    await expect(page.locator('main h3').filter({
      hasText: 'Contact'
    })).toBeVisible();
    const breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(4);
    await expect(breadcrumb.nth(2)).toContainText('Uncategorised');
    await expect(breadcrumb.nth(3)).toContainText('Test Contact');
  });
  test('can process contact with a single contact menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/test-menu-contact-router';
    const contact = await joomla.db_createContact({
      name: 'Test Contact',
      alias: 'test-contact-router'
    });
    await joomla.db_createMenuItem({
      title: 'Test Menu Single Contact',
      alias: 'test-menu-contact-router',
      path: 'test-menu-contact-router',
      link: `index.php?option=com_contact&view=contact&id=${contact.id}`
    });
    let response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}-${contact.alias}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}&catid=${contact.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}-${contact.alias}&catid=${contact.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Menu Single Contact');
    await expect(page.locator('main h1').filter({
      hasText: 'Test Contact'
    })).toBeVisible();
    await expect(page.locator('main h2').filter({
      hasText: 'Contact'
    })).toBeVisible();
    const breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(3);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Single Contact');
  });
  test('can process contact with a category list menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/test-menu-category-router/test-contact-router';
    const contact = await joomla.db_createContact({
      name: 'Test Contact',
      alias: 'test-contact-router'
    });
    await joomla.db_createMenuItem({
      title: 'Test Menu Contact Category',
      alias: 'test-menu-category-router',
      path: 'test-menu-category-router',
      link: `index.php?option=com_contact&view=category&id=${contact.catid}`
    });
    let response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}&catid=${contact.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}-${contact.alias}&catid=${contact.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url.split('/').slice(0, -1).join('/'));
    expect(page.url()).toMatch(new RegExp(`${url.split('/').slice(0, -1).join('/')}$`));
    expect(await page.title()).toBe('Test Menu Contact Category');
    await expect(page.locator('main h1').filter({
      hasText: 'Uncategorised'
    })).toBeVisible();
    let breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(3);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Contact Category');
    expect(await page.locator('main div.com-contact-category a').filter({
      hasText: 'Test Contact'
    }).getAttribute('href')).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Contact');
    await expect(page.locator('main h1').filter({
      hasText: 'Test Contact'
    })).toBeVisible();
    await expect(page.locator('main h2').filter({
      hasText: 'Contact'
    })).toBeVisible();
    breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(4);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Contact Category');
    await expect(breadcrumb.nth(3)).toContainText('Test Contact');
  });
  test('can process contact with a categories list menu item', async ({
    page,
    joomla
  }) => {
    const url = '/index.php/test-menu-categories-router/uncategorised/test-contact-router';
    const contact = await joomla.db_createContact({
      name: 'Test Contact',
      alias: 'test-contact-router'
    });
    await joomla.db_createMenuItem({
      title: 'Test Menu Contact Categories',
      alias: 'test-menu-categories-router',
      path: 'test-menu-categories-router',
      link: 'index.php?option=com_contact&view=categories&id=0'
    });
    const response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}&catid=${contact.catid}`,
      followRedirect: false
    });
    expect(response.status).toBe(301);
    expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    await page.goto(url.split('/').slice(0, -2).join('/'));
    expect(page.url()).toMatch(new RegExp(`${url.split('/').slice(0, -2).join('/')}$`));
    expect(await page.title()).toBe('Test Menu Contact Categories');
    let breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(3);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Contact Categories');
    expect(await page.locator('main div.com-contact-categories h3 a').filter({
      hasText: 'Uncategorised'
    }).getAttribute('href')).toMatch(new RegExp(`${url.split('/').slice(0, -1).join('/')}$`));
    await page.goto(url.split('/').slice(0, -1).join('/'));
    expect(page.url()).toMatch(new RegExp(`${url.split('/').slice(0, -1).join('/')}$`));
    expect(await page.title()).toBe('Test Menu Contact Categories');
    await expect(page.locator('main h1').filter({
      hasText: 'Uncategorised'
    })).toBeVisible();
    breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(4);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Contact Categories');
    await expect(breadcrumb.nth(3)).toContainText('Uncategorised');
    expect(await page.locator('main div.com-contact-category a').filter({
      hasText: 'Test Contact'
    }).getAttribute('href')).toMatch(new RegExp(`${url}$`));
    await page.goto(url);
    expect(page.url()).toMatch(new RegExp(`${url}$`));
    expect(await page.title()).toBe('Test Contact');
    await expect(page.locator('main h1').filter({
      hasText: 'Test Contact'
    })).toBeVisible();
    await expect(page.locator('main h2').filter({
      hasText: 'Contact'
    })).toBeVisible();
    breadcrumb = page.locator('nav.mod-breadcrumbs__wrapper ol.mod-breadcrumbs').locator(":scope > *");
    await expect(breadcrumb).toHaveCount(5);
    await expect(breadcrumb.nth(2)).toContainText('Test Menu Contact Categories');
    await expect(breadcrumb.nth(3)).toContainText('Uncategorised');
    await expect(breadcrumb.nth(4)).toContainText('Test Contact');
  });
  test('can process contact with legacy routing', async ({
    page,
    joomla
  }) => {
    await joomla.db_updateExtensionParameter('sef_ids', '0', 'com_contact');
    const contact = await joomla.db_createContact({
      name: 'Test Contact',
      alias: 'test-contact-router'
    });
    const url = `/index.php/component/contact/contact/${contact.id}-test-contact-router`;
    let response = await joomla.http({
      url,
      followRedirect: false
    });
    expect(response.status).toBe(200);
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}`,
      followRedirect: false
    });
    // @TODO: The following line is just a temporary fix. Remove it and uncomment the 2 lines after it when done.
    expect(response.status).toBe(200);
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
    response = await joomla.http({
      url: `/index.php?option=com_contact&view=contact&id=${contact.id}-${contact.alias}`,
      followRedirect: false
    });
    // @TODO: The following line is just a temporary fix. Remove it and uncomment the 2 lines after it when done.
    expect(response.status).toBe(200);
    // expect(response.status).toBe(301);
    // expect(response.redirectedToUrl).toMatch(new RegExp(`${url}$`));
  });
});
