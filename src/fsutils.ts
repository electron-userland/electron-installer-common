import { rmSync } from 'node:fs';
import { access, cp, mkdtemp, rename, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * Whether the given path exists on the filesystem.
 */
export async function pathExists(checkPath: string): Promise<boolean> {
  try {
    await access(checkPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Moves a file, overwriting the destination if it exists, and falling back to copy + delete when
 * the destination is on a different filesystem.
 */
export async function move(src: string, dest: string): Promise<void> {
  try {
    await rename(src, dest);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EXDEV') {
      await cp(src, dest, { force: true, recursive: true });
      await rm(src, { force: true, recursive: true });
    } else {
      throw error;
    }
  }
}

const tempDirs = new Set<string>();
let cleanupRegistered = false;

/**
 * Creates a temporary directory with the given prefix, which is recursively deleted on process
 * exit.
 */
export async function createTempDir(prefix: string): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirs.add(dir);
  if (!cleanupRegistered) {
    cleanupRegistered = true;
    process.on('exit', () => {
      for (const tempDir of tempDirs) {
        try {
          rmSync(tempDir, { force: true, recursive: true });
        } catch {
          // Best-effort cleanup; never throw during process exit.
        }
      }
    });
  }
  return dir;
}
