import { chmod } from 'node:fs/promises';
import path from 'node:path';
import { pathExists } from './fsutils.js';

/**
 * Returns the path to chrome-sandbox if it exists, undefined otherwise.
 */
async function sandboxHelperPath(appDir: string): Promise<string | undefined> {
  const helperPath = path.join(appDir, 'chrome-sandbox');
  if (await pathExists(helperPath)) {
    return helperPath;
  }
  return undefined;
}

export async function hasSandboxHelper(appDir: string): Promise<boolean> {
  return typeof (await sandboxHelperPath(appDir)) !== 'undefined';
}

/**
 * For Electron versions that support the setuid sandbox on Linux, changes the permissions of
 * the `chrome-sandbox` executable as appropriate.
 *
 * The sandbox helper executable must have the setuid (`+s` / `0o4000`) bit set.
 *
 * This doesn't work on Windows because you can't set that bit there.
 *
 * See: https://github.com/electron/electron/pull/17269#issuecomment-470671914
 */
export async function updateSandboxHelperPermissions(appDir: string): Promise<void> {
  const helperPath = await sandboxHelperPath(appDir);
  if (typeof helperPath !== 'undefined') {
    return chmod(helperPath, 0o4755);
  }
}
