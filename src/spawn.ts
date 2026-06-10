import { spawn as nodeSpawn, type SpawnOptions } from 'node:child_process';

export type CrossSpawnOptions = SpawnOptions & {
  /** Function that handles debug messages, e.g. `debug('electron-installer-something:spawn')` */
  logger?: (message: string) => void;
  /** Updates the error message of a failed command before it is rethrown. */
  updateErrorCallback?: (error: Error, hasLogger: boolean) => void;
};

/**
 * The error thrown when a spawned command exits with a nonzero code.
 */
export class ExitCodeError extends Error {
  constructor(
    public readonly cmd: string,
    public readonly args: string[],
    public readonly code: number | null,
    public readonly stdout: string,
    public readonly stderr: string,
  ) {
    super(`Command failed with a non-zero return code (${code}):\n${cmd} ${args.join(' ')}\n${stdout}\n${stderr}`);
    this.name = 'ExitCodeError';
  }
}

/**
 * Spawns the given command, returning the standard output of the process once it successfully
 * completes.
 *
 * This is an API-compatible replacement for `@malept/cross-spawn-promise`'s `spawn`, which this
 * module historically depended on and re-exported.
 */
export async function spawn(
  cmd: string,
  args: string[] = [],
  options: CrossSpawnOptions = {},
): Promise<string> {
  const { logger, updateErrorCallback, ...spawnOptions } = options;
  logger?.(`Executing command ${cmd} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = nodeSpawn(cmd, args, spawnOptions);
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new ExitCodeError(cmd, args, code, stdout, stderr));
      }
    });
    child.on('error', (error) => {
      if (updateErrorCallback) {
        updateErrorCallback(error, Boolean(logger));
      }
      reject(new Error(`Error executing command (${cmd} ${args.join(' ')}):\n${error.message}`));
    });
  });
}
