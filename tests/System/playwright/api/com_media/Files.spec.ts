// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that media files API endpoint', () => {
  const mediaFixturesFolder = 'tests/System/fixtures/com_media';
  // Create directories and test images before running each test
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.writeRelativeFile({
      path: 'files/test-dir/dummy.txt',
      content: '1'
    });
    await joomla.writeRelativeFile({
      path: 'images/test-dir2/dummy.txt',
      content: '1'
    });
    await joomla.copyRelativeFile({
      source: `${mediaFixturesFolder}/test-image-1.jpg`,
      destination: 'files/test-image-1.jpg'
    });
    await joomla.copyRelativeFile({
      source: `${mediaFixturesFolder}/test-image-2.jpg`,
      destination: 'files/test-dir/test-image-2.jpg'
    });
    await joomla.copyRelativeFile({
      source: `${mediaFixturesFolder}/test-image-3.jpg`,
      destination: 'images/test-dir2/test-image-3.jpg'
    });
  });
  // Delete all files and directories created during the test, only for clean-up and only if they exist
  test.afterAll(async ({
    joomla
  }) => {
    await joomla.deleteRelativePath('files/test-dir');
    await joomla.deleteRelativePath('images/test-dir2');
    await joomla.deleteRelativePath('files/test-image-1.jpg');
  });
  test('can deliver a list of files', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files');
    await joomla.api_responseContains(response, 'name', 'test-dir');
    await joomla.api_responseContains(response, 'name', 'test-image-1.jpg');
  });
  test('can deliver a list of files in a subfolder', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files/test-dir/');
    await joomla.api_responseContains(response, 'name', 'test-image-2.jpg');
  });
  test('can deliver a list of files with an adapter', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files/local-images:/sampledata/cassiopeia/');
    await joomla.api_responseContains(response, 'name', 'nasa1-1200.jpg');
  });
  test('can search in filenames', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files/local-images:/?filter[search]=joomla');
    await joomla.api_responseContains(response, 'name', 'joomla_black.png');
    await expect(response.body.data).toHaveLength(1);
  });
  test('can deliver a single file', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files/local-images:/joomla_black.png');
    await expect(response.body.data.attributes.name).toContain('joomla_black.png');
  });
  test('can deliver a single file with the url', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files/local-images:/joomla_black.png?url=1');
    await expect(response.body.data.attributes.url).toContain('joomla_black.png');
  });
  test('can deliver a single folder', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_get('/media/files/local-images:/sampledata/cassiopeia');
    await expect(response.body.data.attributes.name).toContain('cassiopeia');
  });
  test('can create a file without adapter', async ({
    page,
    joomla
  }) => {
    const data = await joomla.readFile('tests/System/fixtures/com_media/test-image-1.jpg', 'binary');
    const response = await joomla.api_post('/media/files', {
      path: 'test-dir/test.jpg',
      content: Buffer.from(data, 'binary').toString('base64')
    });
    await expect(response.body.data.attributes.name).toContain('test.jpg');
    await expect(response.body.data.attributes.path).toContain('local-files:/test-dir/test.jpg');
  });
  test('can create a folder without adapter', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/media/files', {
      path: 'test-dir/test-from-create'
    });
    await expect(response.body.data.attributes.name).toContain('test-from-create');
    await expect(response.body.data.attributes.path).toContain('local-files:/test-dir/test-from-create');
  });
  test('can create a file with adapter', async ({
    page,
    joomla
  }) => {
    const data = await joomla.readFile('tests/System/fixtures/com_media/test-image-2.jpg', 'binary');
    const response = await joomla.api_post('/media/files', {
      path: 'local-images:/test-dir2/test.jpg',
      content: Buffer.from(data, 'binary').toString('base64')
    });
    await expect(response.body.data.attributes.name).toContain('test.jpg');
    await expect(response.body.data.attributes.path).toContain('local-images:/test-dir2/test.jpg');
  });
  test('can create a folder with adapter', async ({
    page,
    joomla
  }) => {
    const response = await joomla.api_post('/media/files', {
      path: 'local-images:/test-dir2/test-from-create'
    });
    await expect(response.body.data.attributes.name).toContain('test-from-create');
    await expect(response.body.data.attributes.path).toContain('local-images:/test-dir2/test-from-create');
  });
  test('can update a file without adapter', async ({
    page,
    joomla
  }) => {
    await joomla.writeRelativeFile({
      path: 'files/test-dir/override.jpg',
      content: '1',
      mode: 0o666
    });
    const data = await joomla.readFile('tests/System/fixtures/com_media/test-image-1.jpg', 'binary');
    const response = await joomla.api_patch('/media/files/test-dir/override.jpg', {
      path: 'test-dir/override.jpg',
      content: Buffer.from(data, 'binary').toString('base64')
    });
    await expect(response.body.data.attributes.name).toContain('override.jpg');
    await expect(response.body.data.attributes.path).toContain('local-files:/test-dir/override.jpg');
  });
  test('can update a folder without adapter', async ({
    page,
    joomla
  }) => {
    await joomla.writeRelativeFile({
      path: 'files/test-dir/override/test.jpg',
      content: '1',
      mode: 0o666
    });
    const response = await joomla.api_patch('/media/files/test-dir/override', {
      path: 'test-dir/override-new'
    });
    await expect(response.body.data.attributes.name).toContain('override-new');
    await expect(response.body.data.attributes.path).toContain('local-files:/test-dir/override-new');
  });
  test('can update a file with adapter', async ({
    page,
    joomla
  }) => {
    await joomla.writeRelativeFile({
      path: 'images/test-dir2/override.jpg',
      content: '1',
      mode: 0o666
    });
    const data = await joomla.readFile('tests/System/fixtures/com_media/test-image-2.jpg', 'binary');
    const response = await joomla.api_patch('/media/files/local-images:/test-dir2/override.jpg', {
      path: 'local-images:/test-dir2/override.jpg',
      content: Buffer.from(data, 'binary').toString('base64')
    });
    await expect(response.body.data.attributes.name).toContain('override.jpg');
    await expect(response.body.data.attributes.path).toContain('local-images:/test-dir2/override.jpg');
  });
  test('can update a folder with adapter', async ({
    page,
    joomla
  }) => {
    await joomla.writeRelativeFile({
      path: 'images/test-dir2/override/test.jpg',
      content: '1',
      mode: 0o666
    });
    const response = await joomla.api_patch('/media/files/local-images:/test-dir2/override', {
      path: 'local-images:/test-dir2/override-new'
    });
    await expect(response.body.data.attributes.name).toContain('override-new');
    await expect(response.body.data.attributes.path).toContain('local-images:/test-dir2/override-new');
  });
  test("can delete an image in 'files' without adapter", async ({
    page,
    joomla
  }) => {
    await joomla.api_delete('/media/files/test-dir/test-image-2.jpg');
  });
  test("can delete a folder in 'files' without adapter", async ({
    page,
    joomla
  }) => {
    await joomla.api_delete('/media/files/test-dir');
  });
  test("can delete an image in 'images' with adapter", async ({
    page,
    joomla
  }) => {
    await joomla.api_delete('/media/files/local-images:/test-dir2/test-image-3.jpg');
  });
  test("can delete a folder in 'images' with adapter", async ({
    page,
    joomla
  }) => {
    await joomla.api_delete('/media/files/local-images:/test-dir2');
  });
});
