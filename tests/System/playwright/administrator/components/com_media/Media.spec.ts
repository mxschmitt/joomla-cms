import { test, expect } from '../../../../joomla-playwright/src/fixtures';

async function openMedia(page: import('@playwright/test').Page, path = '/administrator/index.php?option=com_media') {
  const wait = page.waitForResponse((resp) => /format=json.*task=api\.files/.test(resp.url()));
  await page.goto(path);
  await wait;
}

test.describe('Test in backend that the media manager', () => {
  test.beforeEach(async ({ joomla }) => {
    await joomla.doAdministratorLogin();
  });

  test('has a title', async ({ page }) => {
    await openMedia(page);
    await expect(page.locator('h1.page-title')).toContainText('Media');
  });

  test('can display the local media data when no path is defined', async ({ page }) => {
    await openMedia(page);
    await expect(page.locator('.media-container')).toContainText('Local');
    await expect(page.locator('.media-browser .media-browser-item-directory').first()).toBeVisible();
    await expect(page.locator('.media-browser .media-browser-image').first()).toBeVisible();
  });

  test('can display the local media data when an adapter is defined in the url', async ({ page }) => {
    await openMedia(page, '/administrator/index.php?option=com_media&path=local-images:/');
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'joomla_black.png' })).toBeVisible();
  });

  test('can display the local media data when an adapter is defined in the session', async ({ page, joomla }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({ selectedDirectory: 'local-images:/' }));
    await openMedia(page);
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'joomla_black.png' })).toBeVisible();
  });

  test('can display the first adapter files when an invalid adapter is defined in the url', async ({ page }) => {
    await openMedia(page, '/administrator/index.php?option=com_media&path=local-invalid:/');
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'joomla_black.png' })).toBeVisible();
  });

  test('can display the first adapter files when an invalid adapter is defined in the session', async ({ page, joomla }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({ selectedDirectory: 'local-invalid:/' }));
    await openMedia(page);
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'joomla_black.png' })).toBeVisible();
  });

  test('can display the local media data from the path in the url', async ({ page }) => {
    await openMedia(page, '/administrator/index.php?option=com_media&path=local-images:/sampledata/cassiopeia');
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'nasa1-1200.jpg' })).toBeVisible();
  });

  test('can display the local media data from the path in the session', async ({ page, joomla }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({ selectedDirectory: 'local-images:/sampledata/cassiopeia' }));
    await openMedia(page);
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'nasa1-1200.jpg' })).toBeVisible();
  });

  test('can display the local media data from the path in the url when also defined in the session', async ({ page, joomla }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({ selectedDirectory: 'local-images:/banners' }));
    await openMedia(page, '/administrator/index.php?option=com_media&path=local-images:/sampledata/cassiopeia');
    await expect(page.locator('.media-browser .media-browser-image').filter({ hasText: 'nasa1-1200.jpg' })).toBeVisible();
  });

  test('can display an error message when an invalid path is defined in the url', async ({ page, joomla }) => {
    await openMedia(page, '/administrator/index.php?option=com_media&path=local-images:/invalid');
    await joomla.checkForSystemMessage('File or Folder not found');
  });

  test('can display an error message when an invalid path is defined in the session', async ({ page, joomla }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({ selectedDirectory: 'local-images:/invalid' }));
    await openMedia(page);
    await joomla.checkForSystemMessage('File or Folder not found');
  });

  test('can not rename to malicious file', async ({ page, joomla }) => {
    await openMedia(page);
    const token = await page.evaluate(() => (window as any).Joomla.getOptions('csrf.token'));
    const response = await joomla.http({
      method: 'PUT',
      url: '/administrator/index.php?option=com_media&format=json&mediatypes=0,1,2,3&task=api.files&path=local-images%3A%2Fpowered_by.png',
      body: {
        [token]: '1',
        newPath: 'local-images:/powered.php',
        move: 0,
      },
      failOnStatusCode: false,
    });
    expect(await joomla.fileExists('images/powered.php')).toBe(false);
    expect([200, 403, 500]).toContain(response.status);
  });

  test('can not traverse up in search', async ({ joomla }) => {
    const response = await joomla.http({
      url: '/administrator/index.php?option=com_media&task=api.files&format=json&path=local-images:/&search=/../../*.txt&recursive=0&content=1&mediatypes=0,1,2,3',
      failOnStatusCode: false,
    });
    expect(response.body?.data || []).toHaveLength(0);
  });
});
