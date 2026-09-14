import {
  chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { umask } from 'node:process';
import type { JoomlaTestConfig } from './types';

export function resolveCmsPath(relativePath: string, config: JoomlaTestConfig): string {
  return join(config.expose.cmsPath, relativePath);
}

function chmodTree(fullPath: string): void {
  try {
    chmodSync(fullPath, 0o777);
  } catch {
    // Keep going so a later rmSync can still remove whatever is writable.
  }
  try {
    if (lstatSync(fullPath).isDirectory()) {
      for (const entry of readdirSync(fullPath)) {
        chmodTree(join(fullPath, entry));
      }
    }
  } catch {
    // Directory may already be gone or unreadable.
  }
}

export function deleteRelativePath(relativePath: string, config: JoomlaTestConfig): null {
  const fullPath = resolveCmsPath(relativePath, config);
  if (existsSync(fullPath)) {
    chmodTree(fullPath);
  }
  rmSync(fullPath, { recursive: true, force: true });
  return null;
}

export function fileExists(relativePath: string, config: JoomlaTestConfig): boolean {
  return existsSync(resolveCmsPath(relativePath, config));
}

export function readRelativeFile(relativePath: string, config: JoomlaTestConfig, encoding: BufferEncoding | 'binary' = 'utf8'): string | Buffer {
  const fullPath = resolveCmsPath(relativePath, config);
  if (encoding === 'binary') {
    return readFileSync(fullPath);
  }
  return readFileSync(fullPath, encoding);
}

export function writeRelativeFile(
  relativePath: string,
  content: string | Buffer,
  config: JoomlaTestConfig,
  mode = 0o444,
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fullPath = join(config.expose.cmsPath, relativePath);
      const oldmask = umask(0);
      mkdirSync(dirname(fullPath), { recursive: true, mode: 0o777 });
      try {
        chmodSync(dirname(fullPath), 0o777);
      } catch {
        // Parent may already be writable.
      }
      if (existsSync(fullPath)) {
        chmodSync(fullPath, 0o666);
      }
      writeFileSync(fullPath, content);
      chmodSync(fullPath, mode);
      umask(oldmask);
      resolve(`File successfully written: ${fullPath}`);
    } catch (error) {
      reject(new Error(`Failed to write file: ${(error as Error).message}`));
    }
  });
}

export function copyRelativeFile(source: string, destination: string, config: JoomlaTestConfig): null {
  copyFileSync(join(config.expose.cmsPath, source), join(config.expose.cmsPath, destination));
  return null;
}
