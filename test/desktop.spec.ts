import path from 'node:path';
import { test } from 'vitest';
import { createDesktopFile } from '../src/desktop.js';
import { assertPathPermissions, SIMPLE_TEMPLATE_PATH, unsafeTempDir } from './util.js';

test('createDesktopFile', () => {
  return unsafeTempDir(async (dir) => {
    const renderedPath = path.join(dir.path, 'rendered.desktop');
    await createDesktopFile(SIMPLE_TEMPLATE_PATH, dir.path, 'rendered', { name: 'World' });
    await assertPathPermissions(renderedPath, 0o644);
  });
});
