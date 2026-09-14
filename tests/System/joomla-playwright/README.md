# joomla-playwright

Local **TypeScript** Playwright counterpart to [`joomla-cypress`](https://github.com/joomla-projects/joomla-cypress).

Playwright is TypeScript-native, so this helper and the mirrored system tests are `.ts`. The Joomla CMS application itself stays PHP/JavaScript.

Joomla system tests need shared helpers that Cypress cannot express natively: installer flow, admin/frontend login, toolbar clicks, database seeding, SMTP capture, and CMS file writes. Those live here so Playwright tests stay readable and follow [Playwright best practices](https://playwright.dev/docs/best-practices) (fixtures, web-first assertions, locators, typed APIs).

This folder is intentionally in-tree while the suite is mirrored. If Playwright is adopted as the primary system-test runner, this package can be published similarly to `joomla-cypress`.
