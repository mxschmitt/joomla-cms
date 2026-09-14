import { test as base, expect } from '@playwright/test';
import { createJoomla } from './index';
import { loadJoomlaTestConfig } from './config';
import { startMailServer } from './node-mail';
import { clearLogs } from './node-logs';
import { deleteInsertedItems } from './node-db';
import type { JoomlaFixtures } from './types';

const joomlaConfig = loadJoomlaTestConfig();
let workerReady = false;

export const test = base.extend<JoomlaFixtures>({
  page: async ({ page }, use) => {
    page.on('dialog', (dialog) => {
      dialog.accept().catch(() => {});
    });
    page.on('pageerror', (error) => {
      if (error.message.includes('Transition was skipped')) {
        return;
      }
    });
    await use(page);
  },
  joomla: async ({ page, request }, use) => {
    if (!workerReady) {
      startMailServer(joomlaConfig);
      clearLogs(joomlaConfig);
      workerReady = true;
    }
    const joomla = createJoomla({ page, request, config: joomlaConfig });
    await use(joomla);
    try {
      await joomla.checkForPhpNoticesOrWarnings();
    } catch (error) {
      await joomla.cleanupDB();
      throw error;
    }
    await joomla.checkForLogs();
    await joomla.cleanupDB();
  },
});

export { expect };

export function getJoomlaConfig() {
  return joomlaConfig;
}

export async function cleanupAfterSuite() {
  await deleteInsertedItems(joomlaConfig);
}
