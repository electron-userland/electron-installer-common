import { extractFile } from '@electron/asar';
import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { wrapError } from './error.js';
import { pathExists } from './fsutils.js';
import type { PackageJSON, ReadMetadataOptions } from './types.js';

async function determineResourcesDir(src: string): Promise<string | undefined> {
  if (await pathExists(path.join(src, 'resources'))) {
    return 'resources';
  }

  return (await Array.fromAsync(glob('*.app/Contents/Resources', { cwd: src })))[0];
}

async function readPackageJSONFromUnpackedApp(
  resourcesDir: string,
  options: ReadMetadataOptions,
): Promise<PackageJSON> {
  const appPackageJSONPath = path.join(options.src, resourcesDir, 'app', 'package.json');
  options.logger(`Reading package metadata from ${appPackageJSONPath}`);

  try {
    return JSON.parse(await readFile(appPackageJSONPath, 'utf8'));
  } catch (err) {
    throw new Error(
      `Could not find, read, or parse package.json in packaged app '${options.src}':\n${(err as Error).message}`,
    );
  }
}

/**
 * Read `package.json` either from `$RESOURCES_DIR/app.asar` (if the app is packaged)
 * or from `$RESOURCES_DIR/app/package.json` (if it is not). `$RESOURCES_DIR` is either
 * `AppName.app/Contents/Resources` on macOS, or `resources` on other platforms.
 *
 * Options used:
 *
 * * `src`: the directory containing the bundled app
 * * `logger`: function that handles debug messages, e.g.,
 *             `debug('electron-installer-something:some-module')`
 */
export async function readMetadata(options: ReadMetadataOptions): Promise<PackageJSON> {
  return wrapError('reading package metadata', async () => {
    const resourcesDir = await determineResourcesDir(options.src);
    if (!resourcesDir) {
      throw new Error('Could not determine resources directory in Electron app');
    }
    const appAsarPath = path.join(options.src, resourcesDir, 'app.asar');

    if (await pathExists(appAsarPath)) {
      options.logger(`Reading package metadata from ${appAsarPath}`);
      return JSON.parse(extractFile(appAsarPath, 'package.json').toString());
    } else {
      return readPackageJSONFromUnpackedApp(resourcesDir, options);
    }
  });
}
