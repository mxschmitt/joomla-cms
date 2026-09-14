// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that contenthistory for content API endpoint', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__content');
    await joomla.queryDB('DELETE FROM #__history');
  });
  test('can get the history of an existing article', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_content'
    });
    const article = await joomla.api_post('/content/articles', {
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
    const response = await joomla.api_get(`/content/articles/${article.body.data.attributes.id}/contenthistory`);
    // Assert response status
    expect(response.status).toBe(200);

    // Extract the `data` array
    const {
      data: historyEntries
    } = response.body;
    console.log(`History Entries: ${historyEntries.length}`);
    // Iterate through each history entry
    historyEntries.forEach(entry => {
      const {
        attributes
      } = entry;
      const historyId = entry.id;
      const saveDate = attributes.save_date;
      const {
        editor
      } = attributes;
      const characterCount = attributes.character_count;
      const versionData = attributes.version_data;
      const articleTitle = versionData.title;
      const {
        alias
      } = versionData;
      const createdDate = versionData.created;
      console.log(`History ID: ${historyId}`);
      console.log(`Save Date: ${saveDate}`);
      console.log(`Editor: ${editor}`);
      console.log(`Character Count: ${characterCount}`);
      console.log(`Article Title: ${articleTitle}`);
      console.log(`Alias: ${alias}`);
      console.log(`Created Date: ${createdDate}`);
      // Perform assertions
      expect(attributes).toHaveProperty('editor_user_id');
      expect(versionData).toHaveProperty('title');
      expect(articleTitle).toBe('automated test article');
    });

    // Check the total pages from metadata
    const totalPages = response.body.meta['total-pages'];
    expect(totalPages).toBe(1);
    console.log(`Total Pages: ${totalPages}`);
  });
  test('can delete the history of an existing article', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_content'
    });
    const article = await joomla.api_post('/content/articles', {
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
    const response = await joomla.api_get(`/content/articles/${article.body.data.attributes.id}/contenthistory`);
    // Assert response status
    expect(response.status).toBe(200);
    // Extract the `data` array
    const {
      data: historyEntries
    } = response.body;
    console.log(`History Entries: ${historyEntries.length}`);
    // Iterate through each history entry
    // Iterate through each history entry
    for (const entry of historyEntries) {
      const result = await joomla.api_delete(`/content/articles/${entry.id}/contenthistory`);
      expect(result.status).toBe(204);
    }
  });
});
