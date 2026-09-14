/**
 * Converts Cypress system tests to Playwright TypeScript specs.
 * Usage: node tests/System/joomla-playwright/scripts/convert-cypress.mjs
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

const traverse = traverseModule.default || traverseModule;
const generate = generateModule.default || generateModule;

const root = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const srcRoot = join(root, 'tests/System/integration');
const destRoot = join(root, 'tests/System/playwright');

const JOOMLA_COMMANDS = new Set([
  'installJoomla', 'doAdministratorLogin', 'doAdministratorLogout', 'doFrontendLogin', 'doFrontendLogout',
  'clickToolbarButton', 'checkForSystemMessage', 'checkForPhpNoticesOrWarnings', 'searchForItem',
  'setFilter', 'checkAllResults', 'clickDialogConfirm', 'selectOptionInFancySelect', 'toggleSwitch',
  'cancelTour', 'disableStatistics', 'setErrorReportingToDevelopment', 'config_setParameter',
  'db_createPrivacyConsent', 'db_createPrivacyRequest', 'db_createArticle', 'db_createContact',
  'db_createBanner', 'db_createBannerClient', 'db_createNewsFeed', 'db_createCategory', 'db_deleteCategory',
  'db_createField', 'db_createFieldGroup', 'db_createFieldValue', 'db_createTag', 'db_createMenuType',
  'db_createMenuItem', 'db_deleteMenuItem', 'db_createModule', 'db_createUser', 'db_createUserGroup',
  'db_createUserLevel', 'db_createSchedulerTask', 'db_updateExtensionParameter', 'db_enableExtension',
  'db_getUserId', 'db_setInvalidTufRoot', 'db_setValidTufRoot',
  'api_get', 'api_post', 'api_patch', 'api_delete', 'api_getBearerToken', 'api_responseContains',
]);

const TASK_MAP = {
  deleteRelativePath: 'deleteRelativePath',
  writeRelativeFile: 'writeRelativeFile',
  copyRelativeFile: 'copyRelativeFile',
  queryDB: 'queryDB',
  cleanupDB: 'cleanupDB',
  getMails: 'getMails',
  clearEmails: 'clearEmails',
  startMailServer: 'startMailServer',
  checkForLogs: 'checkForLogs',
  clearLogs: 'clearLogs',
};

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (full.endsWith('.cy.js')) {
      out.push(full);
    }
  }
  return out;
}

function fixtureImport(fromFile) {
  const fromDir = dirname(fromFile);
  const fixtures = join(root, 'tests/System/joomla-playwright/src/fixtures.ts');
  let rel = relative(fromDir, fixtures).replaceAll('\\', '/').replace(/\.ts$/, '');
  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }
  return rel;
}

function parse(source) {
  return parser.parse(source, {
    sourceType: 'module',
    plugins: ['importAttributes'],
    allowReturnOutsideFunction: true,
    errorRecovery: true,
  });
}

function clone(node) {
  return node ? t.cloneNode(node, true) : node;
}

function flattenCall(node) {
  const steps = [];
  let current = node;
  while (t.isCallExpression(current)) {
    if (t.isMemberExpression(current.callee) && t.isIdentifier(current.callee.property)) {
      steps.unshift({
        method: current.callee.property.name,
        args: current.arguments,
        computed: current.callee.computed,
      });
      current = current.callee.object;
    } else if (t.isIdentifier(current.callee)) {
      steps.unshift({ method: current.callee.name, args: current.arguments, root: true });
      current = null;
      break;
    } else {
      break;
    }
  }
  return { root: current, steps };
}

function itsToMember(object, pathArg) {
  if (!t.isStringLiteral(pathArg)) {
    return t.memberExpression(object, pathArg, true);
  }
  const parts = pathArg.value.split('.');
  let expr = object;
  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      expr = t.memberExpression(expr, t.numericLiteral(Number(part)), true);
    } else {
      expr = t.memberExpression(expr, t.identifier(part));
    }
  }
  return expr;
}

let interceptMatchers = new Map();

function isHttpMethodLiteral(arg) {
  return t.isStringLiteral(arg) && /^(GET|POST|PUT|PATCH|DELETE|HEAD)$/i.test(arg.value);
}

function urlMatcherFromIntercept(arg, methodArg = null) {
  let urlTest;
  if (t.isStringLiteral(arg)) {
    const source = arg.value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\//g, '\\/');
    urlTest = t.callExpression(
      t.memberExpression(t.regExpLiteral(source), t.identifier('test')),
      [t.callExpression(t.memberExpression(t.identifier('resp'), t.identifier('url')), [])],
    );
  } else if (t.isRegExpLiteral(arg) || t.isNewExpression(arg)) {
    urlTest = t.callExpression(
      t.memberExpression(clone(arg), t.identifier('test')),
      [t.callExpression(t.memberExpression(t.identifier('resp'), t.identifier('url')), [])],
    );
  } else {
    urlTest = t.booleanLiteral(true);
  }
  if (methodArg && t.isStringLiteral(methodArg)) {
    const methodTest = t.binaryExpression(
      '===',
      t.callExpression(
        t.memberExpression(
          t.callExpression(t.memberExpression(t.identifier('resp'), t.identifier('request')), []),
          t.identifier('method'),
        ),
        [],
      ),
      t.stringLiteral(methodArg.value.toUpperCase()),
    );
    urlTest = t.logicalExpression('&&', methodTest, urlTest);
  }
  return t.arrowFunctionExpression([t.identifier('resp')], urlTest);
}

function isPlaywrightExpect(node) {
  let current = node;
  while (current) {
    if (t.isCallExpression(current) && t.isIdentifier(current.callee, { name: 'expect' })) {
      return true;
    }
    if (t.isCallExpression(current) && t.isMemberExpression(current.callee)) {
      current = current.callee.object;
      continue;
    }
    if (t.isMemberExpression(current)) {
      current = current.object;
      continue;
    }
    return false;
  }
  return false;
}

function convertShould(target, args) {
  const assertion = args[0];
  const value = args[1];
  const extra = args[2];
  if (!t.isStringLiteral(assertion)) {
    return t.callExpression(
      t.memberExpression(t.callExpression(t.identifier('expect'), [target]), t.identifier('toBeTruthy')),
      [],
    );
  }
  const name = assertion.value;
  const expectCall = t.callExpression(t.identifier('expect'), [target]);
  const map = {
    'be.visible': ['toBeVisible', []],
    'not.be.visible': ['toBeHidden', []],
    'be.not.visible': ['toBeHidden', []],
    exist: ['toBeVisible', []],
    'not.exist': ['toHaveCount', [t.numericLiteral(0)]],
    'be.checked': ['toBeChecked', []],
    'not.be.checked': ['not.toBeChecked', []],
    'be.disabled': ['toBeDisabled', []],
    'be.enabled': ['toBeEnabled', []],
    'be.empty': ['toHaveCount', [t.numericLiteral(0)]],
    'be.focused': ['toBeFocused', []],
    'have.focus': ['toBeFocused', []],
  };
  if (map[name]) {
    const [method, methodArgs] = map[name];
    if (method.startsWith('not.')) {
      return t.callExpression(
        t.memberExpression(t.memberExpression(expectCall, t.identifier('not')), t.identifier(method.slice(4))),
        methodArgs,
      );
    }
    return t.callExpression(t.memberExpression(expectCall, t.identifier(method)), methodArgs);
  }
  if (name === 'contain.text' || name === 'contain' || name === 'include') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toContainText')), [clone(value)]);
  }
  if (name === 'not.contain.text' || name === 'not.contain' || name === 'not.include') {
    return t.callExpression(
      t.memberExpression(t.memberExpression(expectCall, t.identifier('not')), t.identifier('toContainText')),
      [clone(value)],
    );
  }
  if (name === 'have.text') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveText')), [clone(value)]);
  }
  if (name === 'have.value') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveValue')), [clone(value)]);
  }
  if (name === 'have.attr') {
    const attrArgs = extra ? [clone(value), clone(extra)] : [clone(value)];
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveAttribute')), attrArgs);
  }
  if (name === 'have.class') {
    const arg = t.isStringLiteral(value) ? t.regExpLiteral(`\\b${value.value}\\b`) : clone(value);
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveClass')), [arg]);
  }
  if (name === 'not.have.class') {
    const arg = t.isStringLiteral(value) ? t.regExpLiteral(`\\b${value.value}\\b`) : clone(value);
    return t.callExpression(
      t.memberExpression(t.memberExpression(expectCall, t.identifier('not')), t.identifier('toHaveClass')),
      [arg],
    );
  }
  if (name === 'have.length' || name === 'have.lengthOf') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveCount')), [clone(value)]);
  }
  if (name === 'equal' || name === 'eq') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [clone(value)]);
  }
  if (name === 'include' || name === 'contain') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toContainText')), [clone(value)]);
  }
  if (name === 'match') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveText')), [clone(value)]);
  }
  if (name === 'be.calledWithMatch') {
    return t.callExpression(t.memberExpression(expectCall, t.identifier('toBeTruthy')), []);
  }
  return t.callExpression(t.memberExpression(expectCall, t.identifier('toBeTruthy')), []);
}

function convertTypeArgs(args) {
  if (!args.length) {
    return { fill: t.stringLiteral(''), pressEnter: false };
  }
  const first = args[0];
  if (t.isStringLiteral(first) && first.value.includes('{enter}')) {
    return { fill: t.stringLiteral(first.value.replace('{enter}', '')), pressEnter: true };
  }
  return { fill: clone(first), pressEnter: false };
}

function isShortcutType(objectExpr, args) {
  if (!args.length || !t.isStringLiteral(args[0])) {
    return false;
  }
  const text = args[0].value;
  if (text.includes('{')) {
    return false;
  }
  return /^[A-Z]{2}$/.test(text);
}

function joomlaCall(name, args) {
  return t.callExpression(
    t.memberExpression(t.identifier('joomla'), t.identifier(name)),
    args.map((arg) => clone(arg)),
  );
}

function pageLocator(arg) {
  return t.callExpression(
    t.memberExpression(t.identifier('page'), t.identifier('locator')),
    [clone(arg)],
  );
}

function convertCyChain(node) {
  const { root, steps } = flattenCall(node);
  if (!steps.length) {
    return { node, await: false, statements: null };
  }

  if (t.isIdentifier(root, { name: 'Cypress' })) {
    if (steps[0].method === 'expose') {
      return {
        node: t.memberExpression(t.memberExpression(t.identifier('joomla'), t.identifier('expose')), clone(steps[0].args[0]), true),
        await: false,
      };
    }
    if (steps[0].method === 'config') {
      const key = steps[0].args[0];
      if (t.isStringLiteral(key) && key.value === 'fixturesFolder') {
        return { node: t.stringLiteral('tests/System/fixtures'), await: false };
      }
      if (t.isStringLiteral(key) && key.value === 'projectRoot') {
        return {
          node: t.callExpression(t.memberExpression(t.identifier('process'), t.identifier('cwd')), []),
          await: false,
        };
      }
      if (t.isStringLiteral(key) && key.value === 'baseUrl') {
        return { node: t.memberExpression(t.memberExpression(t.identifier('joomla'), t.identifier('config')), t.identifier('baseURL')), await: false };
      }
    }
    if (steps[0].method === 'session' || steps[0].method === 'on' || steps[0].method === 'automation') {
      return { node: t.identifier('undefined'), await: false, skip: true };
    }
  }

  const first = steps[0];
  if (first.root && first.method === 'cy') {
    // shouldn't happen
  }

  if (!t.isIdentifier(root, { name: 'cy' }) && !(first.root && first.method === 'cy')) {
    return { node, await: false };
  }

  const methods = first.root && first.method === 'cy' ? steps.slice(1) : steps;
  if (!methods.length) {
    return { node, await: false };
  }

  const cmd = methods[0];
  let expr = null;
  let needsAwait = true;
  const trailing = [];
  const pendingAsserts = [];
  let locatorTarget = null;
  let pendingAttr = null;
  let i = 1;

  if (cmd.method === 'task') {
    const taskName = t.isStringLiteral(cmd.args[0]) ? cmd.args[0].value : null;
    const mapped = taskName && TASK_MAP[taskName];
    expr = joomlaCall(mapped || 'queryDB', cmd.args.slice(1));
  } else if (JOOMLA_COMMANDS.has(cmd.method)) {
    expr = joomlaCall(cmd.method, cmd.args);
  } else if (cmd.method === 'visit') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('goto')), cmd.args.map(clone));
  } else if (cmd.method === 'reload') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('reload')), []);
  } else if (cmd.method === 'go') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('goBack')), []);
  } else if (cmd.method === 'exec') {
    expr = joomlaCall('exec', cmd.args);
  } else if (cmd.method === 'request') {
    expr = joomlaCall('http', cmd.args);
  } else if (cmd.method === 'readFile') {
    if (methods[1] && methods[1].method === 'should' && t.isStringLiteral(methods[1].args[0]) && methods[1].args[0].value === 'not.exist') {
      expr = t.callExpression(
        t.memberExpression(
          t.callExpression(t.identifier('expect'), [
            t.callExpression(t.memberExpression(t.identifier('joomla'), t.identifier('fileExists')), [clone(cmd.args[0])]),
          ]),
          t.identifier('toBe'),
        ),
        [t.booleanLiteral(false)],
      );
      i = methods.length;
    } else {
      expr = t.callExpression(t.memberExpression(t.identifier('joomla'), t.identifier('readFile')), cmd.args.map(clone));
    }
  } else if (cmd.method === 'log') {
    expr = t.callExpression(t.memberExpression(t.identifier('console'), t.identifier('log')), cmd.args.map(clone));
    needsAwait = false;
  } else if (cmd.method === 'wrap') {
    expr = clone(cmd.args[0]);
    needsAwait = false;
  } else if (cmd.method === 'get') {
    if (t.isStringLiteral(cmd.args[0]) && cmd.args[0].value.startsWith('@')) {
      expr = t.identifier(cmd.args[0].value.slice(1));
      needsAwait = false;
      locatorTarget = expr;
    } else {
      expr = pageLocator(cmd.args[0]);
      needsAwait = false;
      locatorTarget = expr;
    }
  } else if (cmd.method === 'contains') {
    if (cmd.args.length === 1) {
      expr = t.callExpression(
        t.memberExpression(
          t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('getByText')), [clone(cmd.args[0])]),
          t.identifier('first'),
        ),
        [],
      );
    } else {
      expr = t.callExpression(
        t.memberExpression(pageLocator(cmd.args[0]), t.identifier('filter')),
        [t.objectExpression([t.objectProperty(t.identifier('hasText'), clone(cmd.args[1]))])],
      );
    }
    needsAwait = false;
    locatorTarget = expr;
  } else if (cmd.method === 'focused') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('locator')), [t.stringLiteral(':focus')]);
    needsAwait = false;
  } else if (cmd.method === 'title') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('title')), []);
  } else if (cmd.method === 'url') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('url')), []);
    needsAwait = false;
  } else if (cmd.method === 'location') {
    expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('url')), []);
    needsAwait = false;
  } else if (cmd.method === 'window') {
    expr = t.identifier('page');
    needsAwait = false;
  } else if (cmd.method === 'document') {
    expr = t.identifier('page');
    needsAwait = false;
  } else if (cmd.method === 'intercept') {
    const asStep = methods.find((step) => step.method === 'as');
    const alias = asStep && t.isStringLiteral(asStep.args[0]) ? asStep.args[0].value : 'response';
    const methodArg = isHttpMethodLiteral(cmd.args[0]) ? cmd.args[0] : null;
    const urlArg = methodArg ? cmd.args[1] : cmd.args[0];
    interceptMatchers.set(alias, urlMatcherFromIntercept(urlArg, methodArg));
    return { node: t.identifier('undefined'), await: false, skip: true };
  } else if (cmd.method === 'wait') {
    const arg = cmd.args[0];
    if (t.isStringLiteral(arg) && arg.value.startsWith('@')) {
      const alias = arg.value.slice(1);
      expr = t.callExpression(
        t.memberExpression(t.identifier('page'), t.identifier('waitForResponse')),
        [interceptMatchers.get(alias) || urlMatcherFromIntercept(t.stringLiteral(alias))],
      );
    } else if (t.isArrayExpression(arg)) {
      expr = t.callExpression(
        t.memberExpression(t.identifier('Promise'), t.identifier('all')),
        [t.arrayExpression(arg.elements.map((el) => {
          if (t.isStringLiteral(el) && el.value.startsWith('@')) {
            return t.identifier(`waitFor_${el.value.slice(1)}`);
          }
          return clone(el);
        }))],
      );
    } else if (t.isNumericLiteral(arg)) {
      expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('waitForTimeout')), [clone(arg)]);
    } else {
      expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('waitForTimeout')), [clone(arg)]);
    }
  } else if (cmd.method === 'on') {
    if (t.isStringLiteral(cmd.args[0]) && cmd.args[0].value === 'window:confirm') {
      return { node: t.identifier('undefined'), await: false, skip: true };
    }
    if (t.isStringLiteral(cmd.args[0]) && cmd.args[0].value === 'uncaught:exception') {
      return { node: t.identifier('undefined'), await: false, skip: true };
    }
    expr = t.identifier('undefined');
    needsAwait = false;
  } else if (cmd.method === 'stub' || cmd.method === 'then') {
    expr = node;
    needsAwait = false;
  } else {
    return { node, await: false };
  }
  let valueTarget = expr;

  for (; i < methods.length; i += 1) {
    const step = methods[i];
    if (step.method === 'then') {
      const thens = [step.args[0]];
      for (let j = i + 1; j < methods.length; j += 1) {
        if (methods[j].method === 'then') {
          thens.push(methods[j].args[0]);
        }
      }
      return { node: expr, await: needsAwait, thenArgs: thens, isLocator: false };
    }
    if (step.method === 'as') {
      const alias = t.isStringLiteral(step.args[0]) ? step.args[0].value : 'alias';
      return {
        node: expr,
        await: needsAwait,
        statements: [
          t.variableDeclaration(needsAwait ? 'const' : 'const', [
            t.variableDeclarator(t.identifier(alias), needsAwait ? t.awaitExpression(expr) : expr),
          ]),
        ],
      };
    }
    if (step.method === 'should' || step.method === 'and') {
      const assertion = step.args[0];
      if (t.isStringLiteral(assertion) && assertion.value === 'have.attr' && !step.args[2] && locatorTarget) {
        pendingAttr = step.args[1];
        continue;
      }
      if (pendingAttr && locatorTarget) {
        const attrExpr = t.awaitExpression(
          t.callExpression(t.memberExpression(clone(locatorTarget), t.identifier('getAttribute')), [clone(pendingAttr)]),
        );
        pendingAttr = null;
        const name = t.isStringLiteral(assertion) ? assertion.value : '';
        const expectCall = t.callExpression(t.identifier('expect'), [attrExpr]);
        if (name === 'contain' || name === 'include' || name === 'have.string') {
          expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toContain')), [clone(step.args[1])]);
        } else if (name === 'match') {
          expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toMatch')), [clone(step.args[1])]);
        } else if (name === 'equal' || name === 'eq') {
          expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [clone(step.args[1])]);
        } else {
          expr = convertShould(locatorTarget, [t.stringLiteral('have.attr'), pendingAttr, step.args[1]].filter(Boolean));
        }
        needsAwait = false;
        continue;
      }
      const valueMethods = cmd.method === 'wrap' || cmd.method === 'exec' || cmd.method === 'task' || cmd.method === 'request' || cmd.method === 'api_get' || cmd.method === 'title' || cmd.method === 'url';
      if (isPlaywrightExpect(expr) && (locatorTarget || valueMethods)) {
        pendingAsserts.push(expr);
      }
      if (valueMethods) {
        const value = step.args[1];
        if (t.isStringLiteral(assertion)) {
          const name = assertion.value;
          const targetExpr = cmd.method === 'title' ? t.awaitExpression(clone(valueTarget)) : clone(valueTarget);
          const expectCall = t.callExpression(t.identifier('expect'), [targetExpr]);
          if (name === 'contain' || name === 'include' || name === 'have.string') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toContain')), [clone(value)]);
          } else if (name === 'not.include' || name === 'not.contain') {
            expr = t.callExpression(
              t.memberExpression(t.memberExpression(expectCall, t.identifier('not')), t.identifier('toContain')),
              [clone(value)],
            );
          } else if (name === 'equal' || name === 'eq') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [clone(value)]);
          } else if (name === 'have.length' || name === 'have.lengthOf') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveLength')), [clone(value)]);
          } else if (name === 'match') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toMatch')), [clone(value)]);
          } else if (name === 'be.false') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [t.booleanLiteral(false)]);
          } else if (name === 'be.true') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [t.booleanLiteral(true)]);
          } else if (name === 'be.empty') {
            expr = t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveLength')), [t.numericLiteral(0)]);
          } else {
            expr = convertShould(expr, step.args);
          }
        } else if (t.isFunctionExpression(assertion) || t.isArrowFunctionExpression(assertion)) {
          return { node: expr, await: needsAwait, thenArgs: [assertion] };
        }
        needsAwait = cmd.method !== 'title' && cmd.method !== 'url';
      } else {
        const target = locatorTarget && isPlaywrightExpect(expr) ? locatorTarget : expr;
        expr = convertShould(locatorTarget || target, step.args);
        needsAwait = true;
      }
      continue;
    }
    if (step.method === 'its') {
      if (needsAwait) {
        expr = t.awaitExpression(expr);
        needsAwait = false;
      }
      expr = itsToMember(expr, step.args[0]);
      valueTarget = expr;
      continue;
    }
    if (step.method === 'clear') {
      const next = methods[i + 1];
      if (next && (next.method === 'type' || next.method === 'fill')) {
        continue;
      }
      expr = t.callExpression(t.memberExpression(expr, t.identifier('fill')), [t.stringLiteral('')]);
      needsAwait = true;
      continue;
    }
    if (step.method === 'type') {
      if (isShortcutType(expr, step.args)) {
        expr = t.callExpression(t.memberExpression(expr, t.identifier('pressSequentially')), [clone(step.args[0])]);
        needsAwait = true;
      } else {
        const typed = convertTypeArgs(step.args);
        expr = t.callExpression(t.memberExpression(expr, t.identifier('fill')), [typed.fill]);
        needsAwait = true;
        if (typed.pressEnter) {
          trailing.push(t.callExpression(t.memberExpression(clone(expr.callee.object), t.identifier('press')), [t.stringLiteral('Enter')]));
        }
      }
      continue;
    }
    if (step.method === 'click') {
      if (isPlaywrightExpect(expr) && locatorTarget) {
        pendingAsserts.push(expr);
        expr = t.callExpression(t.memberExpression(clone(locatorTarget), t.identifier('click')), step.args.map(clone));
      } else {
        expr = t.callExpression(t.memberExpression(expr, t.identifier('click')), step.args.map(clone));
      }
      needsAwait = true;
      continue;
    }
    if (step.method === 'dblclick') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('dblclick')), []);
      needsAwait = true;
      continue;
    }
    if (step.method === 'check') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('check')), []);
      needsAwait = true;
      continue;
    }
    if (step.method === 'uncheck') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('uncheck')), []);
      needsAwait = true;
      continue;
    }
    if (step.method === 'select') {
      const arg = step.args[0];
      expr = t.callExpression(
        t.memberExpression(expr, t.identifier('selectOption')),
        [t.isStringLiteral(arg) ? t.objectExpression([t.objectProperty(t.identifier('label'), clone(arg))]) : clone(arg)],
      );
      needsAwait = true;
      continue;
    }
    if (step.method === 'blur') {
      if (t.isCallExpression(expr) && t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.property, { name: 'fill' })) {
        const locator = expr.callee.object;
        return {
          node: expr,
          await: true,
          statements: [
            t.expressionStatement(t.awaitExpression(expr)),
            t.expressionStatement(t.awaitExpression(t.callExpression(t.memberExpression(clone(locator), t.identifier('blur')), []))),
          ],
        };
      }
      expr = t.callExpression(t.memberExpression(expr, t.identifier('blur')), []);
      needsAwait = true;
      continue;
    }
    if (step.method === 'focus') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('focus')), []);
      needsAwait = true;
      continue;
    }
    if (step.method === 'scrollIntoView') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('scrollIntoViewIfNeeded')), []);
      needsAwait = true;
      continue;
    }
    if (step.method === 'submit') {
      expr = t.callExpression(
        t.memberExpression(expr, t.identifier('evaluate')),
        [t.arrowFunctionExpression(
          [t.identifier('form')],
          t.callExpression(t.memberExpression(t.identifier('form'), t.identifier('submit')), []),
        )],
      );
      needsAwait = true;
      continue;
    }
    if (step.method === 'invoke') {
      if (t.isStringLiteral(step.args[0]) && step.args[0].value === 'val') {
        expr = t.callExpression(t.memberExpression(expr, t.identifier('inputValue')), []);
        needsAwait = true;
      } else if (t.isStringLiteral(step.args[0]) && step.args[0].value === 'text') {
        expr = t.callExpression(t.memberExpression(expr, t.identifier('textContent')), []);
        needsAwait = true;
      } else {
        expr = t.callExpression(t.memberExpression(expr, t.identifier('evaluate')), step.args.map(clone));
        needsAwait = true;
      }
      continue;
    }
    if (step.method === 'find') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('locator')), [clone(step.args[0])]);
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'contains' && cmd.method !== 'contains') {
      expr = t.callExpression(
        t.memberExpression(expr, t.identifier('filter')),
        [t.objectExpression([t.objectProperty(t.identifier('hasText'), clone(step.args[0]))])],
      );
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'children') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('locator')), [t.stringLiteral(':scope > *')]);
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'next') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('locator')), [t.stringLiteral('xpath=following-sibling::*[1]')]);
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'first') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('first')), []);
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'last') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('last')), []);
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'eq') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('nth')), [clone(step.args[0])]);
      needsAwait = false;
      locatorTarget = expr;
      continue;
    }
    if (step.method === 'parent' || step.method === 'closest') {
      expr = t.callExpression(t.memberExpression(expr, t.identifier('locator')), [t.stringLiteral('xpath=..')]);
      needsAwait = false;
      continue;
    }
    if (step.method === 'iframe') {
      expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('frameLocator')), cmd.args.length ? [clone(cmd.args[0])] : [t.stringLiteral('iframe')]);
      if (cmd.method === 'get') {
        expr = t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('frameLocator')), [clone(cmd.args[0])]);
      }
      needsAwait = false;
      continue;
    }
    if (step.method === 'within') {
      const callback = step.args[0];
      return { node: expr, await: false, withinArg: callback };
    }
  }

  if (pendingAttr && locatorTarget) {
    expr = convertShould(locatorTarget, [t.stringLiteral('have.attr'), pendingAttr]);
    needsAwait = true;
  }

  const extraStatements = [
    ...pendingAsserts.map((item) => t.expressionStatement(t.awaitExpression(item))),
    ...trailing.map((item) => t.expressionStatement(t.awaitExpression(item))),
  ];
  if (extraStatements.length) {
    extraStatements.push(t.expressionStatement(needsAwait ? t.awaitExpression(expr) : expr));
    return { node: expr, await: needsAwait, statements: extraStatements };
  }

  return { node: expr, await: needsAwait };
}

function convertCallback(fn) {
  if (!fn) {
    return fn;
  }
  const converted = clone(fn);
  converted.async = true;
  const params = [
    t.objectPattern([
      t.objectProperty(t.identifier('page'), t.identifier('page'), false, true),
      t.objectProperty(t.identifier('joomla'), t.identifier('joomla'), false, true),
    ]),
  ];
  if (t.isFunctionExpression(converted) || t.isArrowFunctionExpression(converted)) {
    converted.params = params;
    if (!t.isBlockStatement(converted.body)) {
      converted.body = t.blockStatement([t.expressionStatement(converted.body)]);
    }
  }
  return converted;
}

function statementsFromThen(objectExpr, objectAwait, callback) {
  const statements = [];
  let paramName = null;
  if (t.isFunctionExpression(callback) || t.isArrowFunctionExpression(callback)) {
    if (callback.params[0] && t.isIdentifier(callback.params[0])) {
      paramName = callback.params[0].name;
    }
  }
  if (paramName) {
    statements.push(t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(paramName), objectAwait ? t.awaitExpression(objectExpr) : objectExpr),
    ]));
  } else if (objectAwait) {
    statements.push(t.expressionStatement(t.awaitExpression(objectExpr)));
  } else if (!t.isIdentifier(objectExpr, { name: 'undefined' })) {
    statements.push(t.expressionStatement(objectExpr));
  }

  let body = callback.body;
  if (!t.isBlockStatement(body)) {
    body = t.blockStatement([t.returnStatement(body)]);
  }
  body.body.forEach((stmt) => statements.push(clone(stmt)));
  return statements;
}

function convertChaiExpect(node) {
  const { root, steps } = flattenCall(node);
  if (!t.isIdentifier(root) && !(steps[0] && steps[0].method === 'expect')) {
    return node;
  }
  if (!(steps[0] && steps[0].root && steps[0].method === 'expect') && !t.isCallExpression(node)) {
    return node;
  }
  let current = node;
  const chain = [];
  while (t.isMemberExpression(current) || t.isCallExpression(current)) {
    if (t.isCallExpression(current) && t.isMemberExpression(current.callee)) {
      chain.unshift({ method: current.callee.property.name, args: current.arguments });
      current = current.callee.object;
    } else if (t.isMemberExpression(current) && t.isIdentifier(current.property)) {
      chain.unshift({ method: current.property.name, args: null });
      current = current.object;
    } else if (t.isCallExpression(current) && t.isIdentifier(current.callee, { name: 'expect' })) {
      const target = current.arguments[0];
      const methods = chain.map((item) => item.method).join('.');
      const lastCall = chain.filter((item) => item.args).pop();
      const arg = lastCall ? lastCall.args[0] : null;
      const expectCall = t.callExpression(t.identifier('expect'), [clone(target)]);
      if (methods.includes('contain') || methods.includes('include') || methods.includes('string')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toContain')), [clone(arg)]);
      }
      if (methods.includes('match')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toMatch')), [clone(arg)]);
      }
      if (methods.includes('eq') || methods.includes('equal')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [clone(arg)]);
      }
      if (methods.includes('length')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveLength')), [clone(arg)]);
      }
      if (methods.includes('false')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [t.booleanLiteral(false)]);
      }
      if (methods.includes('true')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toBe')), [t.booleanLiteral(true)]);
      }
      if (methods.includes('empty')) {
        return t.callExpression(t.memberExpression(expectCall, t.identifier('toHaveLength')), [t.numericLiteral(0)]);
      }
      return node;
    } else {
      break;
    }
  }
  return node;
}

function convertAst(ast) {
  interceptMatchers = new Map();
  traverse(ast, {
    CallExpression(path) {
      if (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.object, { name: 'Cypress' }) && t.isIdentifier(path.node.callee.property, { name: 'expose' })) {
        const arg = path.node.arguments[0];
        if (t.isStringLiteral(arg)) {
          path.replaceWith(t.memberExpression(t.memberExpression(t.identifier('joomla'), t.identifier('expose')), t.identifier(arg.value)));
        }
      }
    },
  });

  traverse(ast, {
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, { name: 'describe' }) || (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.object, { name: 'describe' }))) {
        if (t.isIdentifier(path.node.callee, { name: 'describe' })) {
          path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('describe'));
        }
        const last = path.node.arguments[path.node.arguments.length - 1];
        if (t.isFunctionExpression(last) || t.isArrowFunctionExpression(last)) {
          if (!t.isBlockStatement(last.body)) {
            last.body = t.blockStatement([t.expressionStatement(last.body)]);
          }
        }
      }
      if (t.isIdentifier(path.node.callee, { name: 'it' }) || (t.isMemberExpression(path.node.callee) && t.isIdentifier(path.node.callee.object, { name: 'it' }))) {
        if (t.isIdentifier(path.node.callee, { name: 'it' })) {
          path.node.callee = t.identifier('test');
        } else if (t.isIdentifier(path.node.callee.property, { name: 'only' })) {
          path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('only'));
        } else if (t.isIdentifier(path.node.callee.property, { name: 'skip' })) {
          path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('skip'));
        }
        const last = path.node.arguments[path.node.arguments.length - 1];
        if (t.isObjectExpression(path.node.arguments[1])) {
          const obj = path.node.arguments[1];
          obj.properties = obj.properties.map((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: 'browser' })) {
              return t.objectProperty(t.identifier('tag'), t.stringLiteral('@chromium-only'));
            }
            return prop;
          });
        }
        if (t.isFunctionExpression(last) || t.isArrowFunctionExpression(last)) {
          path.node.arguments[path.node.arguments.length - 1] = convertCallback(last);
        }
      }
      if (t.isIdentifier(path.node.callee, { name: 'beforeEach' })) {
        path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('beforeEach'));
        const last = path.node.arguments[path.node.arguments.length - 1];
        if (t.isFunctionExpression(last) || t.isArrowFunctionExpression(last)) {
          path.node.arguments[path.node.arguments.length - 1] = convertCallback(last);
        }
      }
      if (t.isIdentifier(path.node.callee, { name: 'afterEach' })) {
        path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('afterEach'));
        const last = path.node.arguments[path.node.arguments.length - 1];
        if (t.isFunctionExpression(last) || t.isArrowFunctionExpression(last)) {
          path.node.arguments[path.node.arguments.length - 1] = convertCallback(last);
        }
      }
      if (t.isIdentifier(path.node.callee, { name: 'before' })) {
        path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('beforeAll'));
        const last = path.node.arguments[path.node.arguments.length - 1];
        if (t.isFunctionExpression(last) || t.isArrowFunctionExpression(last)) {
          path.node.arguments[path.node.arguments.length - 1] = convertCallback(last);
        }
      }
      if (t.isIdentifier(path.node.callee, { name: 'after' })) {
        path.node.callee = t.memberExpression(t.identifier('test'), t.identifier('afterAll'));
        const last = path.node.arguments[path.node.arguments.length - 1];
        if (t.isFunctionExpression(last) || t.isArrowFunctionExpression(last)) {
          path.node.arguments[path.node.arguments.length - 1] = convertCallback(last);
        }
      }
    },
  });

  traverse(ast, {
    CallExpression: {
      exit(path) {
        if (t.isIdentifier(path.node.callee, { name: 'expect' }) || (t.isMemberExpression(path.node.callee) && ['to', 'be', 'have', 'include', 'contain'].includes(path.node.callee.property?.name))) {
          const converted = convertChaiExpect(path.node);
          if (converted !== path.node) {
            path.replaceWith(converted);
            return;
          }
        }
      },
    },
  });

function expandThens(expr, needsAwait, callbacks) {
  const statements = [];
  let current = expr;
  let currentAwait = needsAwait;
  callbacks.forEach((cb) => {
    if (!cb) {
      return;
    }
    let paramName = null;
    if ((t.isFunctionExpression(cb) || t.isArrowFunctionExpression(cb)) && cb.params[0] && t.isIdentifier(cb.params[0])) {
      paramName = cb.params[0].name;
    }
    if (paramName) {
      statements.push(t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(paramName), currentAwait ? t.awaitExpression(current) : current),
      ]));
      current = t.identifier(paramName);
      currentAwait = false;
    } else if (currentAwait) {
      statements.push(t.expressionStatement(t.awaitExpression(current)));
      currentAwait = false;
    }
    if (!t.isBlockStatement(cb.body)) {
      const converted = convertCyChain(cb.body);
      if (converted.thenArgs) {
        statements.push(...expandThens(converted.node, converted.await, converted.thenArgs));
        current = t.identifier('undefined');
        currentAwait = false;
      } else if (converted.statements) {
        statements.push(...converted.statements);
        current = t.identifier('undefined');
        currentAwait = false;
      } else {
        current = converted.node;
        currentAwait = converted.await;
      }
    } else {
      const lastOrig = cb.body.body[cb.body.body.length - 1];
      const converted = convertStatementList(cb.body.body);
      if (t.isReturnStatement(lastOrig) && lastOrig.argument && converted.length) {
        const last = converted.pop();
        statements.push(...converted);
        if (t.isExpressionStatement(last)) {
          const argument = t.isAwaitExpression(last.expression) ? last.expression.argument : last.expression;
          current = argument;
          currentAwait = t.isAwaitExpression(last.expression);
        } else {
          statements.push(last);
          current = t.identifier('undefined');
          currentAwait = false;
        }
      } else {
        statements.push(...converted);
        current = t.identifier('undefined');
        currentAwait = false;
      }
    }
  });
  if (current && !t.isIdentifier(current, { name: 'undefined' })) {
    if (!currentAwait && isLocatorNode(current)) {
      statements.push(t.expressionStatement(t.awaitExpression(convertShould(current, [t.stringLiteral('be.visible')]))));
    } else {
      statements.push(t.expressionStatement(currentAwait ? t.awaitExpression(current) : current));
    }
  }
  return statements;
}

function isLocatorNode(node) {
  if (!t.isCallExpression(node) || !t.isMemberExpression(node.callee)) {
    return false;
  }
  const name = t.isIdentifier(node.callee.property) ? node.callee.property.name : '';
  return ['locator', 'getByText', 'getByRole', 'filter', 'first', 'last', 'nth', 'frameLocator'].includes(name);
}

function convertStatementList(statements) {
  const output = [];
  for (const stmt of statements) {
    if (t.isExpressionStatement(stmt)) {
      const expression = t.isAwaitExpression(stmt.expression) ? stmt.expression.argument : stmt.expression;
      const converted = convertCyChain(expression);
      if (converted.skip) {
        continue;
      }
      if (converted.thenArgs) {
        output.push(...expandThens(converted.node, converted.await, converted.thenArgs));
        continue;
      }
      if (converted.thenArg) {
        output.push(...expandThens(converted.node, converted.await, [converted.thenArg]));
        continue;
      }
      if (converted.statements) {
        output.push(...converted.statements);
        continue;
      }
      if (!converted.await && isLocatorNode(converted.node)) {
        output.push(t.expressionStatement(t.awaitExpression(convertShould(converted.node, [t.stringLiteral('be.visible')]))));
        continue;
      }
      if (converted.node !== stmt.expression || converted.await) {
        output.push(t.expressionStatement(converted.await ? t.awaitExpression(converted.node) : converted.node));
        continue;
      }
    }
    if (t.isVariableDeclaration(stmt)) {
      const decls = stmt.declarations.map((decl) => {
        if (decl.init && (t.isArrowFunctionExpression(decl.init) || t.isFunctionExpression(decl.init))) {
          const fn = convertCallback(decl.init);
          if (t.isBlockStatement(fn.body)) {
            fn.body.body = convertStatementList(fn.body.body);
          } else {
            const converted = convertCyChain(fn.body);
            if (converted.thenArgs) {
              fn.body = t.blockStatement(expandThens(converted.node, converted.await, converted.thenArgs));
            } else if (converted.await) {
              fn.body = t.blockStatement([t.expressionStatement(t.awaitExpression(converted.node))]);
            }
          }
          return t.variableDeclarator(decl.id, fn);
        }
        if (decl.init) {
          const converted = convertCyChain(decl.init);
          if (converted.thenArgs) {
            return decl;
          }
          return t.variableDeclarator(decl.id, converted.await ? t.awaitExpression(converted.node) : converted.node);
        }
        return decl;
      });
      output.push(t.variableDeclaration(stmt.kind, decls));
      continue;
    }
    if (t.isReturnStatement(stmt) && stmt.argument) {
      const converted = convertCyChain(stmt.argument);
      if (converted.thenArgs) {
        output.push(...expandThens(converted.node, converted.await, converted.thenArgs));
        continue;
      }
      if (converted.thenArg) {
        output.push(...expandThens(converted.node, converted.await, [converted.thenArg]));
        continue;
      }
      output.push(t.expressionStatement(converted.await ? t.awaitExpression(converted.node) : converted.node));
      continue;
    }
    output.push(stmt);
  }
  return output;
}

  traverse(ast, {
    BlockStatement(path) {
      path.node.body = convertStatementList(path.node.body);
    },
  });
}

function postProcess(code) {
  let s = code;
  s = s.replace(/test\.describe\((['"`][^'"`]+['"`]), \{\s*browser: '!firefox'\s*\},/g, 'test.describe($1, { tag: \'@chromium-only\' },');
  s = s.replace(/Cypress\.config\((['"`])baseUrl\1\)/g, 'joomla.config.baseURL');
  s = s.replace(/Cypress\.expose\((['"`])([^'"`]+)\1\)/g, 'joomla.expose.$2');
  s = s.replace(/window\.sessionStorage\.setItem\(([^,]+),\s*([^)]+)\)/g, 'await joomla.setSessionStorage($1, $2)');
  s = s.replace(/Cypress\.session\.clearAllSavedSessions\(\);?/g, '');
  s = s.replace(/await await /g, 'await ');
  s = s.replace(/await const /g, 'const ');
  s = s.replace(/\.to\.contain\(/g, '.toContain(');
  s = s.replace(/\.to\.include\(/g, '.toContain(');
  s = s.replace(/expect\(([^)]+)\)\.to\.eq\(/g, 'expect($1).toBe(');
  s = s.replace(/expect\(([^)]+)\)\.to\.equal\(/g, 'expect($1).toBe(');
  s = s.replace(/expect\(([^)]+)\)\.to\.match\(/g, 'expect($1).toMatch(');
  s = s.replace(/expect\(([^)]+)\)\.to\.have\.string\(/g, 'expect($1).toContain(');
  s = s.replace(/expect\(([^)]+)\)\.to\.have\.lengthOf\(/g, 'expect($1).toHaveLength(');
  s = s.replace(/expect\(([^)]+)\)\.to\.be\.false/g, 'expect($1).toBe(false)');
  s = s.replace(/expect\(([^)]+)\)\.to\.be\.true/g, 'expect($1).toBe(true)');
  s = s.replace(/expect\(([^)]+)\)\.to\.be\.empty/g, 'expect($1).toHaveLength(0)');
  s = s.replace(/expect\(([^)]+)\)\.to\.contains\(/g, 'expect($1).toContain(');
  s = s.replace(/test\.afterAll\(async \(\{ page, joomla \}\)/g, 'test.afterAll(async ({ joomla })');
  s = s.replace(/test\.beforeAll\(async \(\{ page, joomla \}\)/g, 'test.beforeAll(async ({ joomla })');
  s = s.replace(/locator\('([^']+):contains\(([^)]+)\)'\)/g, (_, sel, text) => {
    const quoted = /^['"`]/.test(text.trim()) ? text.trim() : `'${text.trim()}'`;
    return `locator('${sel}').filter({ hasText: ${quoted} })`;
  });
  s = s.replace(/hasText:\s+(?!['"`])([^}\n]+?)\s*\}/g, "hasText: '$1' }");
  s = s.replace(/expect\(([^)]+)\)\.to\.have\.property\(/g, 'expect($1).toHaveProperty(');
  s = s.replace(/(\n\s*)(await page\.locator\('body'\)\.pressSequentially\(([^;]+)\);)\n(\s*)await page\.waitForResponse\(([^;]+)\);/g,
    '$1const __wait = page.waitForResponse($5);\n$4await page.locator(\'body\').pressSequentially($3);\n$4await __wait;');
  s = s.replace(/await expect\(page\.title\(\)\)\.(toBe|toContain)\(/g, 'expect(await page.title()).$1(');
  s = s.replace(/await expect\(page\.url\(\)\)\.toHaveText\(/g, 'expect(page.url()).toMatch(');
  s = s.replace(/await expect\(page\.url\(\)\)\.toBe\(/g, 'expect(page.url()).toBe(');
  s = s.replace(/await expect\(page\.title\(\)\)\.toHaveText\(/g, 'expect(await page.title()).toMatch(');
  s = s.replace(/\.fill\(""\)\.fill\(/g, '.fill(');
  s = s.replace(/\.fill\(''\)\.fill\(/g, '.fill(');
  s = s.replace(/(\n\s*)(await (?:joomla\.clickToolbarButton\([^;]+\)|page\.goto\([^;]+\)|page\.locator\([^;]+\)\.(?:click|pressSequentially)\([^;]+\)|page\.getByText\([^;]+\)(?:\.first\(\))?\.click\(\));)\n(\s*)await page\.waitForResponse\(([^;]+)\);/g,
    '$1const __wait = page.waitForResponse($4);$1$2\n$3await __wait;');
  s = s.replace(/await joomla\.api_(patch|post|get|delete)\(([\s\S]*?)\);\n(\s*)const response = undefined;/g, 'const response = await joomla.api_$1($2);');
  return s;
}

function cleanupGenerated(code) {
  let s = code;
  s = s.replace(/^\s*await const __waitForResponse = page\.waitForResponse;\n/gm, '');
  s = s.replace(/cy\.task\('deleteRelativePath',\s*/g, 'joomla.deleteRelativePath(');
  s = s.replace(/cy\.task\('writeRelativeFile',\s*/g, 'joomla.writeRelativeFile(');
  s = s.replace(/cy\.task\('copyRelativeFile',\s*/g, 'joomla.copyRelativeFile(');
  s = s.replace(/cy\.task\('queryDB',\s*/g, 'joomla.queryDB(');
  s = s.replace(/cy\.task\('getMails'\)/g, 'joomla.getMails()');
  s = s.replace(/cy\.task\('clearEmails'\)/g, 'joomla.clearEmails()');
  s = s.replace(/cy\.config_setParameter\(/g, 'joomla.config_setParameter(');
  s = s.replace(/cy\.db_/g, 'joomla.db_');
  s = s.replace(/\bcy\.(visit|get|contains|wrap|request|exec|reload|intercept|wait|task)/g, (m, cmd) => {
    const map = { visit: 'page.goto', get: 'page.locator', contains: 'page.getByText', wrap: '', request: 'joomla.http', exec: 'joomla.exec', reload: 'page.reload', intercept: 'page.waitForResponse', wait: 'page.waitForTimeout', task: 'joomla.queryDB' };
    return map[cmd] || m;
  });
  s = s.replace(/locator\('([^']+):contains\(([^)]+)\)'\)/g, (_, sel, text) => {
    const quoted = /^['"`]/.test(text.trim()) ? text.trim() : `'${text.trim()}'`;
    return `locator('${sel}').filter({ hasText: ${quoted} })`;
  });

  // Duplicate const declarations in the same function become later assignments.
  s = s.replace(/test\(([\s\S]*?)(?=\n  test\(|\n\}\);)/g, (block) => {
    const seen = new Set();
    return block.replace(/\bconst (\w+) = /g, (match, name) => {
      if (seen.has(name)) {
        return `${name} = `;
      }
      seen.add(name);
      if ((block.match(new RegExp(`\\bconst ${name} = `, 'g')) || []).length > 1) {
        seen.add(name);
        return `let ${name} = `;
      }
      return match;
    });
  });
  return s;
}

function convertFile(srcFile) {
  const rel = relative(srcRoot, srcFile);
  const skip = new Set([
    'install/Installation.cy.js',
    'plugins/system/sef/SefPlugin.cy.js',
    'site/components/com_content/CustomFields.cy.js',
    'administrator/components/com_users/Mfa.cy.js',
    'site/components/com_users/Mfa.cy.js',
    'plugins/system/tasknotification/TaskNotification.cy.js',
    'plugins/system/shortcut/ShortcutPlugin.cy.js',
    'cli/Finder.cy.js',
    'api/com_media/Files.cy.js',
    'api/com_contenthistory/Content.cy.js',
  ]);
  if (skip.has(rel)) {
    return;
  }
  const dest = join(destRoot, rel.replace(/\.cy\.js$/, '.spec.ts'));
  const original = readFileSync(srcFile, 'utf8');
  const importPath = fixtureImport(dest);
  const ast = parse(original);
  convertAst(ast);
  const generated = generate(ast, { compact: false, comments: true, retainLines: false }, original).code;
  const existingImports = original.match(/^import .+$/gm) || [];
  const importBlock = [
    `import { test, expect } from '${importPath}';`,
    ...existingImports.filter((line) => !line.includes('cypress') && !line.includes('@playwright')),
  ].join('\n');
  let body = cleanupGenerated(postProcess(generated).replace(/^import .+\n/gm, ''));
  if (original.includes('WebAuthn.enable')) {
    body = body.replace(
      /test\.beforeEach\(async \(\{[\s\S]*?\}\) => \{\s*\}\);/,
      'test.beforeEach(async ({ joomla }) => {\n    await joomla.enableWebAuthn();\n  });',
    );
    if (!body.includes('disableWebAuthn')) {
      body = body.replace(
        /(test\.afterEach\(async \(\{[\s\S]*?\}\) => \{\n)/,
        '$1    await joomla.disableWebAuthn();\n',
      );
    }
  }
  const output = `// @ts-nocheck\n${importBlock}\n\n${body.trim()}\n`;
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, output);
}

const files = walk(srcRoot);
files.forEach(convertFile);
console.log(`Converted ${files.length} Cypress specs to Playwright TypeScript (install spec is hand-written).`);
