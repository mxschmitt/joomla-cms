// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test that the sef system plugin', () => {
  const setSefDefaults = async ({ joomla }) => {
    await joomla.deleteRelativePath('.htaccess');
    await joomla.config_setParameter('sef', true);
    await joomla.config_setParameter('sef_suffix', false);
    await joomla.config_setParameter('sef_rewrite', false);
    await joomla.db_updateExtensionParameter('enforcesuffix', '1', 'plg_system_sef');
    await joomla.db_updateExtensionParameter('indexphp', '1', 'plg_system_sef');
    await joomla.db_updateExtensionParameter('trailingslash', '0', 'plg_system_sef');
    await joomla.db_updateExtensionParameter('strictrouting', '1', 'plg_system_sef');
  };

  test.beforeEach(setSefDefaults);
  test.afterEach(setSefDefaults);

  test('can process if option \'sef\' disabled', async ({ joomla }) => {
    await joomla.config_setParameter('sef', false);
    const ok = await joomla.http({ url: '/index.php?option=com_users&view=login', followRedirect: false });
    expect(ok.status).toBe(200);
    const missing = await joomla.http({ url: '/index.php/component/users/login', failOnStatusCode: false, followRedirect: false });
    expect(missing.status).toBe(404);
  });

  test('can process if option \'enforcesuffix\' enabled', async ({ joomla }) => {
    await joomla.config_setParameter('sef_suffix', true);
    const redirected = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(redirected.status).toBe(301);
    expect(redirected.redirectedToUrl).toMatch(/\/index\.php\/component\/users\/login\.html$/);
    const html = await joomla.http({ url: '/index.php/component/users/login.html', followRedirect: false });
    expect(html.status).toBe(200);
  });

  test('can process if option \'enforcesuffix\' disabled', async ({ joomla }) => {
    await joomla.config_setParameter('sef_suffix', true);
    await joomla.db_updateExtensionParameter('enforcesuffix', '0', 'plg_system_sef');
    const without = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(without.status).toBe(200);
    const withHtml = await joomla.http({ url: '/index.php/component/users/login.html', followRedirect: false });
    expect(withHtml.status).toBe(200);
  });

  test('can process if option \'indexphp\' enabled', async ({ joomla }) => {
    await joomla.config_setParameter('sef_rewrite', true);
    await joomla.copyRelativeFile({ source: 'htaccess.txt', destination: '.htaccess' });
    const redirected = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(redirected.status).toBe(301);
    expect(redirected.redirectedToUrl).toMatch(/(?<!index\.php)\/component\/users\/login$/);
    const rewritten = await joomla.http({ url: '/component/users/login', followRedirect: false });
    expect(rewritten.status).toBe(200);
  });

  test('can process if option \'indexphp\' disabled', async ({ joomla }) => {
    await joomla.config_setParameter('sef_rewrite', true);
    await joomla.copyRelativeFile({ source: 'htaccess.txt', destination: '.htaccess' });
    await joomla.db_updateExtensionParameter('indexphp', '0', 'plg_system_sef');
    const withIndex = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(withIndex.status).toBe(200);
    const withoutIndex = await joomla.http({ url: '/component/users/login', followRedirect: false });
    expect(withoutIndex.status).toBe(200);
  });

  test('can process if option \'trailingslash\' disabled', async ({ page, joomla }) => {
    const slash = await joomla.http({ url: '/index.php/component/users/login/', followRedirect: false });
    expect(slash.status).toBe(301);
    expect(slash.redirectedToUrl).toMatch(/\/index\.php\/component\/users\/login$/);
    const noSlash = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(noSlash.status).toBe(200);
    await page.goto('/');
    await expect(page.locator('li.nav-item').filter({ hasText: 'Home' })).toHaveAttribute('href', /\/index\.php$/);
  });

  test('can process if option \'trailingslash\' enabled', async ({ page, joomla }) => {
    await joomla.db_updateExtensionParameter('trailingslash', '1', 'plg_system_sef');
    const noSlash = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(noSlash.status).toBe(301);
    expect(noSlash.redirectedToUrl).toMatch(/\/index\.php\/component\/users\/login\/$/);
    const slash = await joomla.http({ url: '/index.php/component/users/login/', followRedirect: false });
    expect(slash.status).toBe(200);
    await page.goto('/');
    await expect(page.locator('li.nav-item').filter({ hasText: 'Home' })).toHaveAttribute('href', /\/index\.php\/$/);
  });

  test('can process if option \'strictrouting\' enabled', async ({ joomla }) => {
    const query = await joomla.http({ url: '/index.php?option=com_users&view=login', followRedirect: false });
    expect(query.status).toBe(301);
    expect(query.redirectedToUrl).toMatch(/\/index\.php\/component\/users\/login$/);
    const sef = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(sef.status).toBe(200);
  });

  test('can process if option \'strictrouting\' disabled', async ({ joomla }) => {
    await joomla.db_updateExtensionParameter('strictrouting', '0', 'plg_system_sef');
    const query = await joomla.http({ url: '/index.php?option=com_users&view=login', followRedirect: false });
    expect(query.status).toBe(200);
    const sef = await joomla.http({ url: '/index.php/component/users/login', followRedirect: false });
    expect(sef.status).toBe(200);
  });
});
