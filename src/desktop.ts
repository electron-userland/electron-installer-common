import debugModule from 'debug';
import path from 'node:path';
import { wrapError } from './error.js';
import { createTemplatedFile } from './template.js';

const debug = debugModule('electron-installer-common:desktop');

export async function createDesktopFile(
  templatePath: string,
  dir: string,
  baseName: string,
  options: Record<string, unknown>,
): Promise<void> {
  const dest = path.join(dir, `${baseName}.desktop`);
  debug(`Creating desktop file at ${dest}`);

  return wrapError('creating desktop file', () =>
    createTemplatedFile(templatePath, dest, options, 0o644),
  );
}
