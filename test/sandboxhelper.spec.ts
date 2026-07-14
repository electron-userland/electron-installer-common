import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from 'vitest';
import { hasSandboxHelper } from '../src/sandboxhelper.js';
import { unsafeTempDir } from './util.js';

test('hasSandboxHelper returns true when chrome-sandbox exists', () => {
  return unsafeTempDir(async (dir) => {
    await writeFile(path.join(dir.path, 'chrome-sandbox'), '');
    expect(await hasSandboxHelper(dir.path)).toBe(true);
  });
});

test('hasSandboxhelper returns false when chrome-sandbox does not exist', () => {
  return unsafeTempDir(async (dir) => {
    expect(await hasSandboxHelper(dir.path)).toBe(false);
  });
});
