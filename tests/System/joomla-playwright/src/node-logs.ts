import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { JoomlaTestConfig } from './types';

export function checkForLogs(config: JoomlaTestConfig): null {
  const { logFile } = config.expose;
  if (!existsSync(logFile)) {
    return null;
  }
  const log = readFileSync(logFile, 'utf8');
  if (!log) {
    return null;
  }
  throw new Error(log);
}

export function clearLogs(config: JoomlaTestConfig): null {
  const { logFile } = config.expose;
  if (!existsSync(logFile)) {
    return null;
  }
  writeFileSync(logFile, '');
  return null;
}
