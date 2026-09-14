import type { APIRequestContext, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { HttpResult, JoomlaHelpers } from './types';

let cachedApiToken: string | null = null;

export async function apiGetBearerToken(joomla: JoomlaHelpers, page: Page): Promise<string> {
  if (cachedApiToken) {
    return cachedApiToken;
  }
  if (joomla.apiToken) {
    cachedApiToken = joomla.apiToken;
    return joomla.apiToken;
  }
  const uid = await joomla.db.getUserId();
  await joomla.doAdministratorLogin();
  await page.goto(`/administrator/index.php?option=com_users&task=user.edit&id=${uid}#attrib-joomlatoken`);
  const reset = page.locator('#jform_joomlatoken_reset1');
  if (await reset.count()) {
    await reset.click();
  }
  await joomla.clickToolbarButton('Save');
  const token = await page.locator('#jform_joomlatoken_token').inputValue();
  joomla.apiToken = token;
  cachedApiToken = token;
  return token;
}

export async function apiRequest(
  request: APIRequestContext,
  method: string,
  url: string,
  options: { headers?: Record<string, string>; data?: unknown } = {},
): Promise<HttpResult> {
  const response = await request.fetch(url, {
    method,
    failOnStatusCode: false,
    headers: options.headers,
    data: options.data,
  });
  let body: unknown = null;
  const contentType = response.headers()['content-type'] || '';
  if (contentType.includes('json')) {
    body = await response.json().catch(() => null);
  } else {
    body = await response.text().catch(() => null);
  }
  return {
    status: response.status(),
    body,
    headers: response.headers(),
    url: response.url(),
    redirectedToUrl: response.url(),
    ok: response.ok(),
  };
}

export function apiResponseContains(response: HttpResult, attribute: string, value: unknown): void {
  const payload = response.body as { data?: Array<{ attributes?: Record<string, unknown> }> };
  const items = (payload.data || []).map((item) => ({ attribute: item.attributes?.[attribute] }));
  expect(items).toContainEqual({ attribute: value });
}
