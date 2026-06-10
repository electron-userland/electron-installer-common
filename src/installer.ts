import debugModule from 'debug';
import { chmod, copyFile, cp, glob, mkdir, symlink } from 'node:fs/promises';
import path from 'node:path';
import { createDesktopFile } from './desktop.js';
import { wrapError } from './error.js';
import { createTempDir, move, pathExists } from './fsutils.js';
import { updateSandboxHelperPermissions } from './sandboxhelper.js';
import { createTemplatedFile, renderTemplate } from './template.js';
import type { Configuration, UserSuppliedOptions } from './types.js';

const debug = debugModule('electron-installer-common:installer');

export type CopyFilter = (source: string, destination: string) => boolean | Promise<boolean>;

export type InstallerOptions = Configuration & {
  desktopTemplate?: string;
  dest?: string;
  icon?: string | Record<string, string>;
  packagePaths?: string[];
  rename?: (dest: string, src: string) => string;
  src?: string;
  version?: string;
} & Record<string, unknown>;

/**
 * Merges the given sources into a new object; for each key, the value from the earliest source
 * that defines it wins, ignoring `undefined` values (same semantics as `_.defaults`).
 */
function mergeDefaults(...sources: (Record<string, unknown> | undefined)[]): InstallerOptions {
  const result: Record<string, unknown> = {};
  for (const source of sources) {
    if (!source) {
      continue;
    }
    for (const [key, value] of Object.entries(source)) {
      if (result[key] === undefined) {
        result[key] = value;
      }
    }
  }
  return result as InstallerOptions;
}

export class ElectronInstaller {
  userSupplied: UserSuppliedOptions;
  options!: InstallerOptions;
  stagingDir!: string;

  /** Default options for the installer module; defined by subclasses. */
  declare readonly defaults?: Record<string, unknown>;
  /** Glob pattern matching the generated package files; defined by subclasses. */
  declare readonly packagePattern: string;

  constructor(userSupplied: UserSuppliedOptions) {
    this.userSupplied = userSupplied;
  }

  get appIdentifier(): string {
    return this.options.name as string;
  }

  get baseAppDir(): string {
    return 'usr';
  }

  /* v8 ignore start */
  /**
   * A list of method names to run during `createContents()`.
   */
  get contentFunctions(): string[] {
    throw new Error('Please implement contentFunctions');
  }

  /**
   * The path to the default .desktop file template.
   */
  get defaultDesktopTemplatePath(): string {
    throw new Error('Please implement defaultDesktopTemplatePath');
  }
  /* v8 ignore stop */

  /**
   * The Linux pixmap icon path, relative to the `baseAppDir`.
   */
  get pixmapIconPath(): string {
    return path.join('share', 'pixmaps', `${this.appIdentifier}.png`);
  }

  get sourceDir(): string | undefined {
    if (this.options) {
      return this.options.src;
    } else if (this.userSupplied.src) {
      return this.userSupplied.src;
    } else if (this.userSupplied.options) {
      return this.userSupplied.options.src as string | undefined;
    }

    return undefined;
  }

  /**
   * The directory that the bundled application is copied to, relative to `stagingDir`.
   */
  get stagingAppDir(): string {
    return path.join(this.stagingDir, this.baseAppDir, 'lib', this.appIdentifier);
  }

  /**
   * Copies the bundled application into the staging directory.
   */
  async copyApplication(ignoreFunc?: CopyFilter): Promise<void> {
    debug(`Copying application to ${this.stagingAppDir}`);

    return wrapError('copying application directory', async () => {
      await mkdir(this.stagingAppDir, { mode: 0o755, recursive: true });
      return cp(this.sourceDir as string, this.stagingAppDir, {
        filter: ignoreFunc,
        recursive: true,
      });
    });
  }

  /**
   * Create hicolor icon for the package.
   */
  async copyHicolorIcons(): Promise<void> {
    await Promise.all(
      Object.entries(this.options.icon as Record<string, string>).map(
        ([resolution, iconSrc]) => {
          const iconExt = ['scalable', 'symbolic'].includes(resolution) ? 'svg' : 'png';
          const iconName =
            resolution === 'symbolic' ? `${this.appIdentifier}-symbolic` : this.appIdentifier;
          const iconFile = path.join(
            this.stagingDir,
            this.baseAppDir,
            'share',
            'icons',
            'hicolor',
            resolution,
            'apps',
            `${iconName}.${iconExt}`,
          );

          return wrapError('creating hicolor icon file', async () =>
            this.copyIcon(iconSrc, iconFile),
          );
        },
      ),
    );
  }

  /**
   * Generically copy an icon.
   */
  async copyIcon(src: string, dest: string): Promise<void> {
    debug(`Copying icon file at from "${src}" to "${dest}"`);

    if (!(await pathExists(src))) {
      throw new Error(`The icon "${src}" does not exist`);
    }
    await mkdir(path.dirname(dest), { mode: 0o755, recursive: true });
    await copyFile(src, dest);
    return chmod(dest, 0o644);
  }

  /**
   * Copy `LICENSE` from the root of the app to a different location.
   */
  async copyLicense(copyrightFile: string): Promise<void> {
    const licenseSrc = path.join(this.sourceDir as string, 'LICENSE');
    debug(`Copying license file from ${licenseSrc}`);

    return copyFile(licenseSrc, copyrightFile);
  }

  /**
   * Copy icons into the appropriate locations on Linux.
   */
  async copyLinuxIcons(): Promise<void> {
    if (typeof this.options.icon === 'object' && this.options.icon !== null) {
      return this.copyHicolorIcons();
    } else if (this.options.icon) {
      return this.copyPixmapIcon();
    }
  }

  /**
   * Create pixmap icon for the package.
   */
  async copyPixmapIcon(): Promise<void> {
    const iconFile = path.join(this.stagingDir, this.baseAppDir, this.pixmapIconPath);

    return wrapError('creating pixmap icon file', async () =>
      this.copyIcon(this.options.icon as string, iconFile),
    );
  }

  /**
   * Create the symlink to the binary for the package.
   */
  async createBinarySymlink(): Promise<void> {
    const binSrc = path.join('../lib', this.appIdentifier, this.options.bin as string);
    const binDest = path.join(this.stagingDir, this.baseAppDir, 'bin', this.appIdentifier);
    debug(`Symlinking binary from ${binSrc} to ${binDest}`);

    const bundledBin = path.join(this.sourceDir as string, this.options.bin as string);

    return wrapError('creating binary symlink', async () => {
      if (!(await pathExists(bundledBin))) {
        throw new Error(
          `could not find the Electron app binary at "${bundledBin}". You may need to re-bundle the app using Electron Packager's "executableName" option.`,
        );
      }
      await mkdir(path.dirname(binDest), { mode: 0o755, recursive: true });
      return symlink(binSrc, binDest, 'file');
    });
  }

  /**
   * Generate the contents of the package in "parallel" by calling the methods specified in
   * `contentFunctions` getter through `Promise.all`.
   */
  async createContents(): Promise<void> {
    debug('Creating contents of package');

    return wrapError('creating contents of package', async () => {
      await Promise.all(
        this.contentFunctions.map((name) =>
          (this as unknown as Record<string, () => Promise<unknown>>)[name](),
        ),
      );
    });
  }

  /**
   * Create copyright for the package.
   */
  async createCopyright(): Promise<void> {
    const copyrightFile = path.join(
      this.stagingDir,
      this.baseAppDir,
      'share',
      'doc',
      this.appIdentifier,
      'copyright',
    );
    debug(`Creating copyright file at ${copyrightFile}`);

    return wrapError('creating copyright file', async () => {
      await mkdir(path.dirname(copyrightFile), { mode: 0o755, recursive: true });
      await this.copyLicense(copyrightFile);
      await chmod(copyrightFile, 0o644);
    });
  }

  /**
   * Create the freedesktop.org .desktop file for the package.
   *
   * See: http://standards.freedesktop.org/desktop-entry-spec/latest/
   */
  async createDesktopFile(): Promise<void> {
    const templatePath = this.options.desktopTemplate || this.defaultDesktopTemplatePath;
    const baseDir = path.join(this.stagingDir, this.baseAppDir, 'share', 'applications');
    return createDesktopFile(templatePath, baseDir, this.appIdentifier, this.options);
  }

  /**
   * Create temporary directory where the contents of the package will live.
   */
  async createStagingDir(): Promise<void> {
    debug('Creating staging directory');

    return wrapError('creating staging directory', async () => {
      const dir = await createTempDir('electron-installer-');
      this.stagingDir = path.join(
        dir,
        `${this.appIdentifier}_${this.options.version}_${this.options.arch}`,
      );
      await mkdir(this.stagingDir, { mode: 0o755, recursive: true });
    });
  }

  async createTemplatedFile(
    templatePath: string,
    dest: string,
    filePermissions?: number,
  ): Promise<void> {
    return createTemplatedFile(templatePath, dest, this.options, filePermissions);
  }

  /**
   * Flattens and merges default values, CLI-supplied options, and API-supplied options.
   */
  generateOptions(): void {
    this.options = mergeDefaults(this.userSupplied, this.userSupplied.options, this.defaults);
  }

  /**
   * Move the package to the specified destination.
   *
   * Also adds `packagePaths` to `options`, which is an `Array` of the absolute paths to the
   * moved packages.
   */
  async movePackage(): Promise<void> {
    debug('Moving package to destination');

    return wrapError('moving package files', async () => {
      // Backslashes are treated as path separators, not escapes, as with the
      // `windowsPathsNoEscape` option from the `glob` package.
      const files = await Array.fromAsync(glob(this.packagePattern.replaceAll('\\', '/')));
      this.options.packagePaths = await Promise.all(
        files.map(async (file) => {
          const renameTemplate = (this.options.rename as (dest: string, src: string) => string)(
            this.options.dest as string,
            path.basename(file),
          );
          const dest = renderTemplate(renameTemplate, this.options);
          debug(`Moving file ${file} to ${dest}`);
          await move(file, dest);
          return dest;
        }),
      );
    });
  }

  /**
   * For Electron versions that support the setuid sandbox on Linux, changes the permissions of
   * the `chrome-sandbox` executable as appropriate.
   */
  async updateSandboxHelperPermissions(): Promise<void> {
    return updateSandboxHelperPermissions(this.stagingAppDir);
  }
}
