import type { APIRequestContext, CDPSession, Page } from '@playwright/test';

export interface JoomlaExpose {
  sitename: string;
  name: string;
  email: string;
  username: string;
  password: string;
  db_type: string;
  db_host: string;
  db_port: string;
  db_name: string;
  db_user: string;
  db_password: string;
  db_prefix: string;
  smtp_host: string;
  smtp_port: string;
  cmsPath: string;
  logFile: string;
}

export interface JoomlaTestConfig {
  baseURL: string;
  cmsRoot: string;
  expose: JoomlaExpose;
}

export type DbRecord = Record<string, any>;

export interface CliResult {
  stdout: string;
  stderr: string;
  code: number;
  exitCode: number;
}

export interface HttpResult<T = any> {
  status: number;
  body: T;
  headers: Record<string, string>;
  url: string;
  redirectedToUrl: string;
  ok: boolean;
}

export interface MailMessage {
  sender?: string;
  body?: string;
  html?: string | false;
  headers?: Record<string, string>;
  receivers?: Record<string, unknown>;
  attachments?: unknown[];
}

export interface JoomlaHelpers {
  expose: JoomlaExpose;
  config: JoomlaTestConfig;
  page: Page;
  request: APIRequestContext;
  apiToken: string | null;

  queryDB(sql: string): Promise<any>;
  cleanupDB(): Promise<unknown>;
  writeRelativeFile(args: { path: string; content: string | Buffer; mode?: number }): Promise<string>;
  deleteRelativePath(path: string): null;
  copyRelativeFile(args: { source: string; destination: string }): null;
  fileExists(path: string): boolean;
  readFile(path: string, encoding?: BufferEncoding | 'binary'): string | Buffer;
  fixturesFolder: string;
  checkForLogs(): null;
  clearLogs(): null;
  getMails(): Promise<MailMessage[]>;
  clearEmails(): null;
  startMailServer(): null;

  db_createPrivacyConsent(data?: DbRecord): Promise<number>;
  db_createPrivacyRequest(data?: DbRecord): Promise<number>;
  db_createArticle(data?: DbRecord): Promise<DbRecord>;
  db_createContact(data?: DbRecord): Promise<DbRecord>;
  db_createBanner(data?: DbRecord): Promise<DbRecord>;
  db_createBannerClient(data?: DbRecord): Promise<DbRecord>;
  db_createNewsFeed(data?: DbRecord): Promise<DbRecord>;
  db_createCategory(data?: DbRecord): Promise<number>;
  db_deleteCategory(data: { title: string }): Promise<void>;
  db_createField(data?: DbRecord): Promise<number>;
  db_createFieldGroup(data?: DbRecord): Promise<number>;
  db_createFieldValue(data?: DbRecord): Promise<number>;
  db_createTag(data?: DbRecord): Promise<number>;
  db_createMenuType(data?: DbRecord): Promise<number>;
  db_createMenuItem(data?: DbRecord): Promise<number>;
  db_deleteMenuItem(data: { title: string }): Promise<void>;
  db_createModule(data?: DbRecord): Promise<number>;
  db_createUser(data?: DbRecord): Promise<number>;
  db_createUserGroup(data?: DbRecord): Promise<DbRecord>;
  db_createUserLevel(data?: DbRecord): Promise<DbRecord>;
  db_createSchedulerTask(data?: DbRecord): Promise<DbRecord>;
  db_updateExtensionParameter(key: string, value: unknown, extension: string): Promise<any>;
  db_enableExtension(value: number | string, extension: string): Promise<any>;
  db_getUserId(): Promise<number>;
  db_setInvalidTufRoot(): Promise<void>;
  db_setValidTufRoot(): Promise<void>;

  db: {
    query(sql: string): Promise<any>;
    createPrivacyConsent(data?: DbRecord): Promise<number>;
    createPrivacyRequest(data?: DbRecord): Promise<number>;
    createArticle(data?: DbRecord): Promise<DbRecord>;
    createContact(data?: DbRecord): Promise<DbRecord>;
    createBanner(data?: DbRecord): Promise<DbRecord>;
    createBannerClient(data?: DbRecord): Promise<DbRecord>;
    createNewsFeed(data?: DbRecord): Promise<DbRecord>;
    createCategory(data?: DbRecord): Promise<number>;
    deleteCategory(data: { title: string }): Promise<void>;
    createField(data?: DbRecord): Promise<number>;
    createFieldGroup(data?: DbRecord): Promise<number>;
    createFieldValue(data?: DbRecord): Promise<number>;
    createTag(data?: DbRecord): Promise<number>;
    createMenuType(data?: DbRecord): Promise<number>;
    createMenuItem(data?: DbRecord): Promise<number>;
    deleteMenuItem(data: { title: string }): Promise<void>;
    createModule(data?: DbRecord): Promise<number>;
    createUser(data?: DbRecord): Promise<number>;
    createUserGroup(data?: DbRecord): Promise<DbRecord>;
    createUserLevel(data?: DbRecord): Promise<DbRecord>;
    createSchedulerTask(data?: DbRecord): Promise<DbRecord>;
    updateExtensionParameter(key: string, value: unknown, extension: string): Promise<any>;
    enableExtension(value: number | string, extension: string): Promise<any>;
    getUserId(): Promise<number>;
    setInvalidTufRoot(): Promise<void>;
    setValidTufRoot(): Promise<void>;
  };

  doAdministratorLogin(user?: string | null, password?: string | null, useSnapshot?: boolean): Promise<void>;
  doAdministratorLogout(): Promise<void>;
  openAdministratorAccount(): Promise<void>;
  doFrontendLogin(user?: string | null, password?: string | null, useSnapshot?: boolean): Promise<void>;
  doFrontendLogout(): Promise<void>;
  clickToolbarButton(button: string, subselector?: string | null): Promise<void>;
  checkForSystemMessage(contain: string): Promise<void>;
  checkForPhpNoticesOrWarnings(): Promise<void>;
  searchForItem(name?: string | null): Promise<void>;
  setFilter(name: string, value: string): Promise<void>;
  checkAllResults(): Promise<void>;
  clickDialogConfirm(isOkay: boolean): Promise<void>;
  selectOptionInFancySelect(selectId: string, option: string): Promise<void>;
  toggleSwitch(fieldName: string, valueName: string): Promise<void>;
  cancelTour(): Promise<void>;
  disableStatistics(): Promise<void>;
  setErrorReportingToDevelopment(): Promise<void>;
  installJoomla(installConfig: JoomlaExpose): Promise<void>;
  prepareInstaller(): Promise<void>;
  config_setParameter(parameter: string, value: string | number | boolean): Promise<string>;
  exec(command: string, options?: { failOnNonZeroExit?: boolean }): Promise<CliResult>;
  enableWebAuthn(): Promise<CDPSession>;
  disableWebAuthn(): Promise<void>;
  api_getBearerToken(): Promise<string>;
  api_get(path: string): Promise<HttpResult>;
  api_post(path: string, body?: unknown): Promise<HttpResult>;
  api_patch(path: string, body?: unknown): Promise<HttpResult>;
  api_delete(path: string): Promise<HttpResult>;
  api_responseContains(response: HttpResult, attribute: string, value: unknown): void;
  http(url: string | { url: string; method?: string; failOnStatusCode?: boolean; followRedirect?: boolean; headers?: Record<string, string>; data?: unknown; body?: unknown; json?: boolean }, options?: {
    method?: string;
    failOnStatusCode?: boolean;
    followRedirect?: boolean;
    headers?: Record<string, string>;
    data?: unknown;
    body?: unknown;
    json?: boolean;
  }): Promise<HttpResult>;
  setSessionStorage(key: string, value: string): Promise<void>;
}

export type JoomlaFixtures = {
  joomla: JoomlaHelpers;
};
