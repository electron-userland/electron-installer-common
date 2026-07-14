import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Reads the Electron version from the bundled Electron app's "version" file.
 *
 * The content of the version file pre-4.0 is the tag name, e.g. "v1.8.1".
 * The content of the version file post-4.0 is just the version.
 * Both of these are acceptable to the `semver` module.
 */
export async function readElectronVersion(appDir: string): Promise<string> {
  const tag = await readFile(path.resolve(appDir, 'version'), 'utf8');
  return tag.trim();
}
