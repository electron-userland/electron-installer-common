import { access, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect } from 'vitest';

export const SIMPLE_TEMPLATE_PATH = path.resolve(
  import.meta.dirname,
  'fixtures',
  'template',
  'simple.ejs',
);

async function pathExists(pathToCheck: string): Promise<boolean> {
  try {
    await access(pathToCheck);
    return true;
  } catch {
    return false;
  }
}

export async function assertPathExists(pathToCheck: string): Promise<void> {
  expect(await pathExists(pathToCheck), `File "${pathToCheck}" should exist`).toBe(true);
}

export async function assertPathNotExists(pathToCheck: string): Promise<void> {
  expect(await pathExists(pathToCheck), `File "${pathToCheck}" should not exist`).toBe(false);
}

export async function assertPathPermissions(
  pathToCheck: string,
  expectedPermissions: number,
): Promise<void> {
  const stats = await stat(pathToCheck);
  const actual = stats.mode & 0o7777;
  const msg = `Expected mode=${expectedPermissions.toString(8)}, got ${actual.toString(8)}`;
  if (process.platform === 'win32') {
    expect((actual & expectedPermissions) === expectedPermissions, msg).toBe(true);
  } else {
    expect(actual, msg).toBe(expectedPermissions);
  }
}

export async function assertTrimmedFileContents(
  filePath: string,
  expectedContents: string,
): Promise<void> {
  const data = await readFile(filePath);
  expect(data.toString().trim()).toBe(expectedContents);
}

export async function unsafeTempDir(
  callback: (dir: { path: string }) => Promise<void>,
): Promise<void> {
  const dirPath = await mkdtemp(path.join(os.tmpdir(), 'electron-installer-common-test-'));
  try {
    await callback({ path: dirPath });
  } finally {
    await rm(dirPath, { force: true, recursive: true });
  }
}
