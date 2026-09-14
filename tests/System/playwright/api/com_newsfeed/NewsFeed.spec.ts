// @ts-nocheck
import { test, expect } from '../../../joomla-playwright/src/fixtures';

test.describe('Test that newsfeed API endpoint', () => {
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB("DELETE FROM #__newsfeeds where name LIKE 'automated test feed'");
  });
  ['joomla.org'].forEach(file => {
    test(`can deliver a list of feeds from ${file}`, async ({
      page,
      joomla
    }) => {
      await joomla.db_createNewsFeed({
        name: 'automated test feed',
        link: `${joomla.config.baseURL}/tests/System/data/com_newsfeeds/${file}.xml`
      });
      const response = await joomla.api_get('/newsfeeds/feeds');
      await expect(response.body.data[0].attributes.name).toContain('automated test feed');
    });
    test('can create a feed', async ({
      page,
      joomla
    }) => {
      const categoryId = await joomla.db_createCategory({
        extension: 'com_newsfeeds'
      });
      const response = await joomla.api_post('/newsfeeds/feeds', {
        name: 'automated test feed',
        alias: 'test-feed',
        link: `${joomla.config.baseURL}/tests/System/data/com_newsfeeds/${file}.xml`,
        catid: categoryId,
        published: 1,
        language: '*',
        metadesc: '',
        metakey: '',
        description: '',
        images: {
          float_first: '',
          float_second: '',
          image_first: '',
          image_first_alt: '',
          image_first_caption: '',
          image_second: '',
          image_second_alt: '',
          image_second_caption: ''
        },
        metadata: {
          hits: '',
          rights: '',
          robots: '',
          tags: {
            tags: '',
            typeAlias: null
          }
        },
        params: {
          feed_character_count: '',
          feed_display_order: '',
          newsfeed_layout: '',
          show_feed_description: '',
          show_feed_image: '',
          show_item_description: ''
        }
      });
      await expect(response.body.data.attributes.name).toContain('automated test feed');
    });
    test('can update a feed', async ({
      page,
      joomla
    }) => {
      const feed = await joomla.db_createNewsFeed({
        name: 'automated test contact',
        access: 1,
        link: `${joomla.config.baseURL}/tests/System/data/com_newsfeeds/${file}.xml`
      });
      const response = await joomla.api_patch(`/newsfeeds/feeds/${feed.id}`, {
        name: 'updated automated test feed'
      });
      await expect(response.body.data.attributes.name).toContain('updated automated test feed');
    });
    test('can delete a feed', async ({
      page,
      joomla
    }) => {
      const feed = await joomla.db_createNewsFeed({
        name: 'automated test contact',
        access: 1,
        link: `${joomla.config.baseURL}/tests/System/data/com_newsfeeds/${file}.xml`,
        published: -2
      });
      await joomla.api_delete(`/newsfeeds/feeds/${feed.id}`);
    });
  });
});
