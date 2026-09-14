// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the content component with custom fields', () => {
  let fieldGroupId;
  let article;

  test.beforeEach(async ({ page, joomla }) => {
    await joomla.doAdministratorLogin();
    article = await joomla.db_createArticle({ title: 'Test Article Frontend' });
    fieldGroupId = await joomla.db_createFieldGroup({
      title: 'Test Field Group Frontend',
      context: 'com_content.article',
    });
  });

  test.afterEach(async ({ joomla }) => {
    await joomla.queryDB("DELETE FROM #__content WHERE title LIKE '%Test Article%'");
    await joomla.queryDB("DELETE FROM #__fields_groups WHERE context = 'com_content.article'");
    await joomla.queryDB("DELETE FROM #__fields WHERE context = 'com_content.article'");
  });

  async function createFieldWithValue(joomla, fieldOptions, value) {
    const fieldId = await joomla.db_createField({
      context: 'com_content.article',
      group_id: fieldGroupId,
      ...fieldOptions,
    });
    await joomla.db_createFieldValue({
      field_id: fieldId,
      item_id: article.id,
      value,
    });
  }

  async function visitContentFrontend(page) {
    await page.goto(`/index.php?option=com_content&view=article&id=${article.id}&catid=${article.catid}`);
  }

  test('displays a custom text field value', async ({ page, joomla }) => {
    await createFieldWithValue(joomla, { title: 'Test Text Field', name: 'test-text-field-frontend', type: 'text' }, 'My custom text value');
    await visitContentFrontend(page);
    await expect(page.getByText('My custom text value').first()).toBeVisible();
  });

  test('does not display an unpublished field', async ({ page, joomla }) => {
    await createFieldWithValue(joomla, {
      title: 'Unpublished Field', name: 'unpublished-field-frontend', type: 'text', state: 0,
    }, 'This is a secret');
    await visitContentFrontend(page);
    await expect(page.getByText('This is a secret')).toHaveCount(0);
  });

  test('hides the field label when configured', async ({ page, joomla }) => {
    await createFieldWithValue(joomla, {
      title: 'Hidden Label Field',
      label: 'Hidden Label Field',
      name: 'hidden-label-field-frontend',
      type: 'text',
      params: JSON.stringify({ showlabel: '0' }),
    }, 'Value with a hidden label');
    await visitContentFrontend(page);
    await expect(page.getByText('Hidden Label Field')).toHaveCount(0);
    await expect(page.getByText('Value with a hidden label').first()).toBeVisible();
  });

  test('applies a custom display class to the field container', async ({ page, joomla }) => {
    await createFieldWithValue(joomla, {
      title: 'Render Class Field',
      name: 'render-class-field',
      type: 'text',
      params: JSON.stringify({ render_class: 'my-custom-class' }),
    }, 'This field has a custom class');
    await visitContentFrontend(page);
    await expect(page.locator('.my-custom-class')).toContainText('This field has a custom class');
    await expect(page.locator('.my-custom-class')).toBeVisible();
  });

  test('applies a custom value class to the field value', async ({ page, joomla }) => {
    await createFieldWithValue(joomla, {
      title: 'Render Class Field',
      name: 'render-class-field',
      type: 'text',
      params: JSON.stringify({ value_render_class: 'my-custom-class' }),
    }, 'This field has a custom class');
    await visitContentFrontend(page);
    await expect(page.locator('.my-custom-class')).toContainText('This field has a custom class');
    await expect(page.locator('.my-custom-class')).toBeVisible();
  });

  test('displays a prefix and suffix around the value', async ({ page, joomla }) => {
    await createFieldWithValue(joomla, {
      title: 'Prefix Suffix Field',
      name: 'prefix-suffix-field',
      type: 'text',
      params: JSON.stringify({ prefix: 'Before...', suffix: '...After' }),
    }, 'the value');
    await visitContentFrontend(page);
    await expect(page.getByText('Before... the value ...After').first()).toBeVisible();
  });
});
