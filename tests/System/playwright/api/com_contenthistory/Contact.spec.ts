// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that contenthistory for contact API endpoint', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__contact_details');
    await joomla.queryDB('DELETE FROM #__history');
  });
  test('can get the history of an existing contact', async ({
    page,
    joomla
  }) => {
    const categoryId = await joomla.db_createCategory({
      extension: 'com_contact'
    });
    const contact = await joomla.api_post('/contacts', {
      name: 'automated test contact',
      alias: 'test-contact',
      catid: categoryId,
      published: 1,
      language: '*'
    });
    const response = await joomla.api_get(`/contacts/${contact.body.data.attributes.id}/contenthistory`);
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
      const contactName = versionData.name;
      const {
        alias
      } = versionData;
      const createdDate = versionData.created;
      console.log(`History ID: ${historyId}`);
      console.log(`Save Date: ${saveDate}`);
      console.log(`Editor: ${editor}`);
      console.log(`Character Count: ${characterCount}`);
      console.log(`Contact Name: ${contactName}`);
      console.log(`Alias: ${alias}`);
      console.log(`Created Date: ${createdDate}`);
      // Perform assertions
      expect(attributes).toHaveProperty('editor_user_id');
      expect(versionData).toHaveProperty('name');
      expect(contactName).toBe('automated test contact');
    });

    // Check the total pages from metadata
    const totalPages = response.body.meta['total-pages'];
    expect(totalPages).toBe(1);
    console.log(`Total Pages: ${totalPages}`);
  });
});
