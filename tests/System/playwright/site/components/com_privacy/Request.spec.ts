// @ts-nocheck
import { test, expect } from '../../../../joomla-playwright/src/fixtures';

test.describe('Test in frontend that the privacy request view', () => {
  test.beforeEach(async ({
    page,
    joomla
  }) => {
    await joomla.clearEmails();
    await joomla.doFrontendLogin();
  });
  test.afterEach(async ({
    page,
    joomla
  }) => {
    await joomla.queryDB('DELETE FROM #__privacy_requests');
  });
  test('can submit an information request of type export without a menu item', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_privacy&view=request');
    await page.locator('#jform_request_type').selectOption({
      label: 'Export'
    });
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await expect(page.locator('.alert-message')).toContainText('Your information request has been created. Before it can be processed, you must verify this request. An email has been sent to your address with additional instructions to complete this verification.');
    expect(mails.length).toBe(2);
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].body).toContain(`A new information request has been submitted by ${joomla.expose.email}.`);
    await expect(mails[1].body).toContain('Someone has created a request to export all personal information related to this email address at ');
  });
  test('can submit an information request of type export in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Automated export information',
      link: 'index.php?option=com_privacy&view=request'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated export information'}).click();
    await page.locator('#jform_request_type').selectOption({
      label: 'Export'
    });
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await expect(page.locator('.alert-message')).toContainText('Your information request has been created. Before it can be processed, you must verify this request. An email has been sent to your address with additional instructions to complete this verification.');
    expect(mails.length).toBe(2);
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].body).toContain(`A new information request has been submitted by ${joomla.expose.email}.`);
    await expect(mails[1].body).toContain('Someone has created a request to export all personal information related to this email address at ');
  });
  test('can submit an information request of type remove without a menu item', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_privacy&view=request');
    await page.locator('#jform_request_type').selectOption({
      label: 'Remove'
    });
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await expect(page.locator('.alert-message')).toContainText('Your information request has been created. Before it can be processed, you must verify this request. An email has been sent to your address with additional instructions to complete this verification.');
    expect(mails.length).toBe(2);
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].body).toContain(`A new information request has been submitted by ${joomla.expose.email}.`);
    await expect(mails[1].body).toContain('Someone has created a request to remove all personal information related to this email address at ');
  });
  test('can submit an information request of type remove in a menu item', async ({
    page,
    joomla
  }) => {
    await joomla.db_createMenuItem({
      title: 'Automated remove information',
      link: 'index.php?option=com_privacy&view=request'
    });
    await page.goto('/');
    await page.locator('a').filter({ hasText: 'Automated remove information'}).click();
    await page.locator('#jform_request_type').selectOption({
      label: 'Remove'
    });
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    await expect(page.locator('.alert-message')).toContainText('Your information request has been created. Before it can be processed, you must verify this request. An email has been sent to your address with additional instructions to complete this verification.');
    expect(mails.length).toBe(2);
    await expect(mails[0].sender).toBe(joomla.expose.email);
    await expect(mails[0].body).toContain(`A new information request has been submitted by ${joomla.expose.email}.`);
    await expect(mails[1].body).toContain('Someone has created a request to remove all personal information related to this email address at ');
  });
  test('can verify link sent to user is valid', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_privacy&view=request');
    await page.locator('#jform_request_type').selectOption({
      label: 'Export'
    });
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    expect(mails.length).toBe(2);
    const str = mails[1].body;
    const firstSplit = str.split('URL: ')[1];
    const link = firstSplit.split('\n')[0];
    await page.goto(link);
    await page.locator('.controls > .btn').click();
    await expect(page.locator('.alert-message')).toHaveText('Your information request has been confirmed. We will process your request as soon as possible and the export will be sent to your email.');
  });
  test('can verify the individual link and password to copy/paste to the user is valid', async ({
    page,
    joomla
  }) => {
    await page.goto('/index.php?option=com_privacy&view=request');
    await page.locator('#jform_request_type').selectOption({
      label: 'Export'
    });
    await page.locator('.controls > .btn').click();
    const mails = await joomla.getMails();
    expect(mails.length).toBe(2);
    const str = mails[1].body;
    const firstSplitURL = str.split('paste your token into the form.\n')[1];
    const secondSplitURL = firstSplitURL.split('URL: ')[1];
    const link = secondSplitURL.split('\n')[0];
    const firstSplitToken = str.split('Token: ')[1];
    const token = firstSplitToken.split('\n')[0];
    await page.goto(link);
    await page.locator('#jform_confirm_token').fill(token);
    await page.locator('.controls > .btn').click();
    await expect(page.locator('.alert-message')).toHaveText('Your information request has been confirmed. We will process your request as soon as possible and the export will be sent to your email.');
  });
});
