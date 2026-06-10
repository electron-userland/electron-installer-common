import path from 'node:path';
import { expect, test } from 'vitest';
import { createTemplatedFile, generateTemplate } from '../src/template.js';
import {
  assertPathPermissions,
  assertTrimmedFileContents,
  SIMPLE_TEMPLATE_PATH,
  unsafeTempDir,
} from './util.js';

test('generateTemplate', async () => {
  const data = await generateTemplate(SIMPLE_TEMPLATE_PATH, { name: 'World' });
  expect(data.trim()).toBe('Hello, World!');
});

test('createTemplatedFile', () => {
  return unsafeTempDir(async (dir) => {
    const renderedPath = path.join(dir.path, 'rendered');
    await createTemplatedFile(SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' });
    await assertTrimmedFileContents(renderedPath, 'Hello, World!');
  });
});

test('createTemplatedFile with permissions', () => {
  return unsafeTempDir(async (dir) => {
    const renderedPath = path.join(dir.path, 'rendered');
    await createTemplatedFile(SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' }, 0o644);
    await assertTrimmedFileContents(renderedPath, 'Hello, World!');
    await assertPathPermissions(renderedPath, 0o644);
  });
});
