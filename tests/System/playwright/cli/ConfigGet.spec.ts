// @ts-nocheck
import { test, expect } from '../../joomla-playwright/src/fixtures';

test.describe('Test CLI command config:get', () => {
  test('can get all configuration options', async ({
    page,
    joomla
  }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get`);
    expect(result.stdout).toContain('Option');
    expect(result.stdout).toContain('Value');
    expect(result.stdout).toContain('sitename');
    expect(result.stdout).toContain('dbtype');
  });
  test('can get database configuration group', async ({
    page,
    joomla
  }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get --group=db`);
    // Check output contains expected database configuration options
    expect(result.stdout).toContain('Option');
    expect(result.stdout).toContain('Value');
    expect(result.stdout).toContain('dbtype');
    expect(result.stdout).toContain('host');
    expect(result.stdout).toContain('user');
    expect(result.stdout).toContain('password');
    expect(result.stdout).toContain('dbprefix');
    expect(result.stdout).toContain('db');
    expect(result.stdout).toContain('dbencryption');
    expect(result.stdout).toContain('dbsslverifyservercert');
    // Check for specific values
    expect(result.stdout.toLowerCase()).toContain(joomla.expose.db_type.toLowerCase());
    expect(result.stdout).toContain('root');
  });
  test('can get mail configuration group', async ({
    page,
    joomla
  }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get --group=mail`);
    // Check output contains expected mail configuration options
    expect(result.stdout).toContain('Option');
    expect(result.stdout).toContain('Value');
    expect(result.stdout).toContain('mailonline');
    expect(result.stdout).toContain('mailer');
    expect(result.stdout).toContain('mailfrom');
    expect(result.stdout).toContain('sendmail');
    expect(result.stdout).toContain('smtpauth');
    expect(result.stdout).toContain('smtpuser');
    expect(result.stdout).toContain('smtppass');
    expect(result.stdout).toContain('smtphost');
    expect(result.stdout).toContain('smtpsecure');
    expect(result.stdout).toContain('smtpport');
  });
  test('can get session configuration group', async ({
    page,
    joomla
  }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get --group=session`);
    // Check output contains expected session configuration options
    expect(result.stdout).toContain('Option');
    expect(result.stdout).toContain('Value');
    expect(result.stdout).toContain('session_handler');
    expect(result.stdout).toContain('shared_session');
    expect(result.stdout).toContain('session_metadata');

    // Check for specific values
    expect(result.stdout).toContain('database');
    expect(result.stdout).toContain('false');
  });
  test('get error for non existent configuration group', async ({
    page,
    joomla
  }) => {
    const result = await joomla.exec(`php ${joomla.expose.cmsPath}/cli/joomla.php config:get --group=test`, {
      failOnNonZeroExit: false
    });
    expect(result.stdout).toContain('[ERROR] Group *test* not found');
  });
});
