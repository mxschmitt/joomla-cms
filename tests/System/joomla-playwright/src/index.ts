import type { APIRequestContext, CDPSession, Page } from '@playwright/test';
import * as db from './db';
import * as ui from './ui';
import * as api from './api';
import { writeRelativeFile, deleteRelativePath, copyRelativeFile, fileExists, readRelativeFile } from './node-fs';
import { getMails, clearEmails, startMailServer } from './node-mail';
import { checkForLogs, clearLogs } from './node-logs';
import { deleteInsertedItems } from './node-db';
import type { HttpResult, JoomlaHelpers, JoomlaTestConfig } from './types';

/**
 * Build the Joomla helper object attached to every Playwright test via fixtures.
 */
export function createJoomla({
  page,
  request,
  config,
}: {
  page: Page;
  request: APIRequestContext;
  config: JoomlaTestConfig;
}): JoomlaHelpers {
  db.configureDb(config);
  let cdpSession: CDPSession | null = null;

  const joomla: JoomlaHelpers = {
    expose: config.expose,
    config,
    page,
    request,
    apiToken: null,

    queryDB: (sql) => db.queryDB(sql),
    cleanupDB: () => deleteInsertedItems(config),
    writeRelativeFile: (args) => writeRelativeFile(args.path, args.content, config, args.mode),
    deleteRelativePath: (path) => deleteRelativePath(path, config),
    copyRelativeFile: (args) => copyRelativeFile(args.source, args.destination, config),
    fileExists: (path) => fileExists(path, config),
    readFile: (path, encoding) => readRelativeFile(path, config, encoding),
    fixturesFolder: 'tests/System/fixtures',
    checkForLogs: () => checkForLogs(config),
    clearLogs: () => clearLogs(config),
    getMails: () => getMails(),
    clearEmails: () => clearEmails(),
    startMailServer: () => startMailServer(config),

    db_createPrivacyConsent: db.createPrivacyConsent,
    db_createPrivacyRequest: db.createPrivacyRequest,
    db_createArticle: db.createArticle,
    db_createContact: db.createContact,
    db_createBanner: db.createBanner,
    db_createBannerClient: db.createBannerClient,
    db_createNewsFeed: db.createNewsFeed,
    db_createCategory: db.createCategory,
    db_deleteCategory: db.deleteCategory,
    db_createField: db.createField,
    db_createFieldGroup: db.createFieldGroup,
    db_createFieldValue: db.createFieldValue,
    db_createTag: db.createTag,
    db_createMenuType: db.createMenuType,
    db_createMenuItem: db.createMenuItem,
    db_deleteMenuItem: db.deleteMenuItem,
    db_createModule: db.createModule,
    db_createUser: db.createUser,
    db_createUserGroup: db.createUserGroup,
    db_createUserLevel: db.createUserLevel,
    db_createSchedulerTask: db.createSchedulerTask,
    db_updateExtensionParameter: db.updateExtensionParameter,
    db_enableExtension: db.enableExtension,
    db_getUserId: db.getUserId,
    db_setInvalidTufRoot: db.setInvalidTufRoot,
    db_setValidTufRoot: db.setValidTufRoot,

    db: {
      query: (sql) => db.queryDB(sql),
      createPrivacyConsent: db.createPrivacyConsent,
      createPrivacyRequest: db.createPrivacyRequest,
      createArticle: db.createArticle,
      createContact: db.createContact,
      createBanner: db.createBanner,
      createBannerClient: db.createBannerClient,
      createNewsFeed: db.createNewsFeed,
      createCategory: db.createCategory,
      deleteCategory: db.deleteCategory,
      createField: db.createField,
      createFieldGroup: db.createFieldGroup,
      createFieldValue: db.createFieldValue,
      createTag: db.createTag,
      createMenuType: db.createMenuType,
      createMenuItem: db.createMenuItem,
      deleteMenuItem: db.deleteMenuItem,
      createModule: db.createModule,
      createUser: db.createUser,
      createUserGroup: db.createUserGroup,
      createUserLevel: db.createUserLevel,
      createSchedulerTask: db.createSchedulerTask,
      updateExtensionParameter: db.updateExtensionParameter,
      enableExtension: db.enableExtension,
      getUserId: db.getUserId,
      setInvalidTufRoot: db.setInvalidTufRoot,
      setValidTufRoot: db.setValidTufRoot,
    },

    doAdministratorLogin: (user, password, useSnapshot) => ui.doAdministratorLogin(page, config.expose, user, password, useSnapshot),
    doAdministratorLogout: () => ui.doAdministratorLogout(page),
    doFrontendLogin: (user, password, useSnapshot) => ui.doFrontendLogin(page, config.expose, user, password, useSnapshot),
    doFrontendLogout: () => ui.doFrontendLogout(page),
    clickToolbarButton: (button, subselector) => ui.clickToolbarButton(page, button, subselector),
    checkForSystemMessage: (contain) => ui.checkForSystemMessage(page, contain),
    checkForPhpNoticesOrWarnings: () => ui.checkForPhpNoticesOrWarnings(page),
    searchForItem: (name) => ui.searchForItem(page, name),
    setFilter: (name, value) => ui.setFilter(page, name, value),
    checkAllResults: () => ui.checkAllResults(page),
    clickDialogConfirm: (isOkay) => ui.clickDialogConfirm(page, isOkay),
    selectOptionInFancySelect: (selectId, option) => ui.selectOptionInFancySelect(page, selectId, option),
    toggleSwitch: (fieldName, valueName) => ui.toggleSwitch(page, fieldName, valueName),
    cancelTour: () => ui.cancelTour(page),
    disableStatistics: () => ui.disableStatistics(page),
    setErrorReportingToDevelopment: () => ui.setErrorReportingToDevelopment(page),
    installJoomla: (installConfig) => ui.installJoomla(page, installConfig),
    prepareInstaller: () => ui.prepareInstaller(page),
    config_setParameter: (parameter, value) => ui.configSetParameter(config, parameter, value),
    exec: (command, options) => ui.execPhp(command, options),
    async enableWebAuthn() {
      cdpSession = await ui.enableWebAuthn(page);
      return cdpSession;
    },
    async disableWebAuthn() {
      await ui.disableWebAuthn(cdpSession);
      cdpSession = null;
    },
    api_getBearerToken: () => api.apiGetBearerToken(joomla, page),
    async api_get(path) {
      const token = await api.apiGetBearerToken(joomla, page);
      return api.apiRequest(request, 'GET', `/api/index.php/v1${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    async api_post(path, body) {
      const token = await api.apiGetBearerToken(joomla, page);
      return api.apiRequest(request, 'POST', `/api/index.php/v1${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: body,
      });
    },
    async api_patch(path, body) {
      const token = await api.apiGetBearerToken(joomla, page);
      return api.apiRequest(request, 'PATCH', `/api/index.php/v1${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: body,
      });
    },
    async api_delete(path) {
      const token = await api.apiGetBearerToken(joomla, page);
      return api.apiRequest(request, 'DELETE', `/api/index.php/v1${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    api_responseContains(response, attribute, value) {
      api.apiResponseContains(response, attribute, value);
    },
    async http(urlOrOptions, options = {}) {
      const requestOptions = typeof urlOrOptions === 'string' ? { url: urlOrOptions, ...options } : { ...urlOrOptions, ...options };
      const {
        url,
        method = 'GET',
        failOnStatusCode = true,
        followRedirect = true,
        headers = {},
        data,
        body,
        json,
      } = requestOptions;
      const payload = data ?? body;
      const hdrs: Record<string, string> = { ...headers };
      let requestData: unknown = payload;
      const isJson = json === true
        || (hdrs['Content-Type'] || hdrs['content-type'] || '').includes('json');
      if (
        payload
        && typeof payload === 'object'
        && !Buffer.isBuffer(payload)
        && method.toUpperCase() !== 'GET'
        && !isJson
      ) {
        hdrs['Content-Type'] = hdrs['Content-Type'] || hdrs['content-type'] || 'application/x-www-form-urlencoded';
        requestData = new URLSearchParams(
          Object.entries(payload as Record<string, unknown>).map(([key, value]) => [key, String(value)]),
        ).toString();
      }
      const response = await request.fetch(url, {
        method,
        headers: hdrs,
        data: method.toUpperCase() === 'GET' ? undefined : requestData,
        maxRedirects: followRedirect ? 20 : 0,
        failOnStatusCode: false,
      });
      let parsed: unknown = null;
      const contentType = response.headers()['content-type'] || '';
      if (contentType.includes('json')) {
        parsed = await response.json().catch(() => null);
      } else {
        parsed = await response.text().catch(() => null);
        try {
          parsed = JSON.parse(String(parsed));
        } catch {
          // keep text body
        }
      }
      const location = response.headers().location;
      const redirectedToUrl = location
        ? new URL(location, config.baseURL).href
        : response.url();
      const result: HttpResult = {
        status: response.status(),
        body: parsed,
        headers: response.headers(),
        url: response.url(),
        redirectedToUrl,
        ok: response.ok(),
      };
      if (failOnStatusCode && !response.ok()) {
        throw new Error(`HTTP ${result.status} for ${url}`);
      }
      return result;
    },
    async setSessionStorage(key, value) {
      await page.addInitScript(([storageKey, storageValue]) => {
        window.sessionStorage.setItem(storageKey, storageValue);
      }, [key, value]);
    },
  };

  return joomla;
}

export { loadJoomlaTestConfig } from './config';
