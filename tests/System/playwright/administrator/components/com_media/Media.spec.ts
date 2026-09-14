// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in backend that the media manager', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.doAdministratorLogin();
  });
  test('has a title', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    await expect(page.locator('h1.page-title')).toContainText('Media');
  });
  test('can display the local media data when no path is defined', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    await expect(page.locator('.media-container')).toContainText('Local');
    await expect(page.locator('.media-browser .media-browser-item-directory')).toBeVisible();
    await expect(page.locator('.media-browser .media-browser-image')).toBeVisible();
  });
  test('can display the local media data when an adapter is defined in the url', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media&path=local-images:/');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('joomla_black.png');
  });
  test('can display the local media data when an adapter is defined in the session', async ({
    page,
    joomla
  }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({
      selectedDirectory: 'local-images:/'
    }));
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('joomla_black.png');
  });
  test('can display the first adapter files when an invalid adapter is defined in the url', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media&path=local-invalid:/');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('joomla_black.png');
  });
  test('can display the first adapter files when an invalid adapter is defined in the session', async ({
    page,
    joomla
  }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({
      selectedDirectory: 'local-invalid:/'
    }));
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('joomla_black.png');
  });
  test('can display the local media data from the path in the url', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media&path=local-images:/sampledata/cassiopeia');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('nasa1-1200.jpg');
  });
  test('can display the local media data from the path in the session', async ({
    page,
    joomla
  }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({
      selectedDirectory: 'local-images:/sampledata/cassiopeia'
    }));
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('nasa1-1200.jpg');
  });
  test('can display the local media data from the path in the url when also defined in the session', async ({
    page,
    joomla
  }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({
      selectedDirectory: 'local-images:/banners'
    }));
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media&path=local-images:/sampledata/cassiopeia');
    await __wait;
    await expect(page.locator('.media-browser .media-browser-image')).toContainText('nasa1-1200.jpg');
  });
  test('can display an error message when an invalid path is defined in the url', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media&path=local-images:/invalid');
    await __wait;
    await joomla.checkForSystemMessage('File or Folder not found');
  });
  test('can display an error message when an invalid path is defined in the session', async ({
    page,
    joomla
  }) => {
    await joomla.setSessionStorage('joomla.mediamanager', JSON.stringify({
      selectedDirectory: 'local-images:/invalid'
    }));
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    await joomla.checkForSystemMessage('File or Folder not found');
  });
  test('can not rename to malicious file', async ({
    page,
    joomla
  }) => {
    const __wait = page.waitForResponse(resp => /.*format=json.*task=api\.files.*/.test(resp.url()));
    await page.goto('/administrator/index.php?option=com_media');
    await __wait;
    const win = page;
    const token = win.Joomla.getOptions('csrf.token');
    const response = await joomla.http({
      method: 'put',
      url: '/administrator/index.php?option=com_media&format=json&mediatypes=0,1,2,3&task=api.files&path=local-images%3A%2Fpowered_by.png',
      body: {
        [token]: '1',
        newPath: 'local-images:/powered.php',
        move: 0
      },
      failOnStatusCode: false
    });
    expect(response.status).toBe(500);
    await expect(joomla.fileExists('images/powered.php')).toBe(false);
  });
  test('can not traverse up in search', async ({
    page,
    joomla
  }) => {
    const response = await joomla.http('/administrator/index.php?option=com_media&task=api.files&format=json&path=local-images:/&search=/../../*.txt&recursive=0&content=1&mediatypes=0,1,2,3');
    await expect(response.body.data).toHaveLength(0);
  });
});
