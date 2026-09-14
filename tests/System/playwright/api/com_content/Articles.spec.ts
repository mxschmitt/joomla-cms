// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that content API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__content');
  });
  test('can deliver a list of articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article'
    });
    const response = await joomla.api_get('/content/articles');
    await expect(response.body.data[0].attributes.title).toContain('automated test article');
  });
  test('can deliver a list of articles filtered by the modified start and end filter', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article before',
      modified: '2025-03-15 10:00:00'
    });
    await joomla.db_createArticle({
      title: 'automated test article within',
      modified: '2025-03-15 15:00:00'
    });
    await joomla.db_createArticle({
      title: 'automated test article after',
      modified: '2025-03-15 20:00:00'
    });
    const response = await joomla.api_get('/content/articles?filter[modified_start]=2025-03-15 14:00:00&filter[modified_end]=2025-03-15 16:00:00');
    await expect(expect(expect(response.body.data[0].attributes.title).toContain('automated test article within')).not.toContain('automated test article before')).not.toContain('automated test article after');
  });
  test('can deliver a list of unpublished articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article',
      state: 0
    });
    const response = await joomla.api_get('/content/articles?filter[state]=0');
    await expect(response.body.data[0].attributes.title).toContain('automated test article');
  });
  test('can deliver a list of published articles', async ({
    page,
    joomla
  }) => {
    await joomla.db_createArticle({
      title: 'automated test article',
      state: 1
    });
    const response = await joomla.api_get('/content/articles?filter[state]=1');
    await expect(response.body.data[0].attributes.title).toContain('automated test article');
  });
  test('can deliver a single article', async ({
    page,
    joomla
  }) => {
    const article = await joomla.db_createArticle({
      title: 'automated test article'
    });
    const response = await joomla.api_get(`/content/articles/${article.id}`);
    await expect(response.body.data.attributes.title).toContain('automated test article');
  });
  test('can deliver a single article with separate fields intro and full text ', async ({
    page,
    joomla
  }) => {
    const article = await joomla.db_createArticle({
      title: 'automated test article',
      introtext: 'This is the intro text.',
      fulltext: 'This is the full text.'
    });
    const response = await joomla.api_get(`/content/articles/${article.id}`);
    await response.body.data.attributes;
  });
  test('can create an article', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_content'
    });
    const response = await joomla.api_post('/content/articles', {
      title: 'automated test article',
      alias: 'test-article',
      catid: categoryId,
      introtext: '',
      fulltext: '',
      state: 1,
      access: 1,
      language: '*',
      created: '2023-01-01 20:00:00',
      modified: '2023-01-01 20:00:00',
      images: '',
      urls: '',
      attribs: '',
      metadesc: '',
      metadata: ''
    });
    await expect(response.body.data.attributes.title).toContain('automated test article');
  });
  test('can update an article', async ({
    page,
    joomla
  }) => {
    const article = await joomla.db_createArticle({
      title: 'automated test article'
    });
    const response = await joomla.api_patch(`/content/articles/${article.id}`, {
      title: 'updated automated test article'
    });
    await expect(response.body.data.attributes.title).toContain('updated automated test article');
  });
  test('can delete an article', async ({
    page,
    joomla
  }) => {
    const article = await joomla.db_createArticle({
      title: 'automated test article',
      state: -2
    });
    await joomla.api_delete(`/content/articles/${article.id}`);
  });
  test('creates unique alias when duplicate article is created', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_content'
    });
    await joomla.api_post('/content/articles', {
      title: 'test article',
      alias: 'test-article',
      catid: categoryId,
      introtext: '',
      fulltext: '',
      state: 1,
      access: 1,
      language: '*',
      created: '2023-01-01 20:00:00',
      modified: '2023-01-01 20:00:00',
      images: '',
      urls: '',
      attribs: '',
      metadesc: '',
      metadata: ''
    });
    await joomla.api_post('/content/articles', {
      title: 'test article',
      alias: 'test-article',
      catid: categoryId,
      introtext: '',
      fulltext: '',
      state: 1,
      access: 1,
      language: '*',
      created: '2023-01-01 20:00:00',
      modified: '2023-01-01 20:00:00',
      images: '',
      urls: '',
      attribs: '',
      metadesc: '',
      metadata: ''
    });
    const response = undefined;
    await expect(response.body.data.attributes.alias).toBe('test-article-2');
  });
});
