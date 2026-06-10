import { expectTypeOf, test } from 'vitest';
import * as common from '../src/index.js';

test('ElectronInstaller types', async () => {
  const installer = new common.ElectronInstaller({});
  await installer.copyApplication(async () => true);
  await installer.copyHicolorIcons();
  await installer.copyIcon('source.png', 'dest.png');
  await installer.copyLicense('LICENSE');
  await installer.copyLinuxIcons();
  await installer.copyPixmapIcon();
  await installer.createBinarySymlink();
  await installer.createContents();
  await installer.createCopyright();
  await installer.createDesktopFile();
  await installer.createStagingDir();
  await installer.createTemplatedFile('template', 'dest');
  installer.generateOptions();
  await installer.movePackage();
  await installer.updateSandboxHelperPermissions();
});

test('desktop/template types', async () => {
  await common.createDesktopFile('template', 'dir', 'baseName', { foo: 'bar' });
  await common.createTemplatedFile('template', 'destDir', { foo: 'bar' }, 0o644);
  expectTypeOf(common.errorMessage('message', new Error('test'))).toEqualTypeOf<string>();
  expectTypeOf(await common.generateTemplate('template', { foo: 'bar' })).toEqualTypeOf<string>();
});

test('dependency types', () => {
  const dependencyMap: common.DependencyMap = {
    atspi: 'libatspi',
    drm: 'libdrm',
    gbm: 'libgbm',
    gconf: 'libgconf',
    glib2: 'libglib2',
    gtk2: 'libgtk2',
    gtk3: 'libgtk3',
    gvfs: 'gvfs',
    kdeCliTools: 'kde-cli-tools',
    kdeRuntime: 'kde-runtime',
    notify: 'libnotify',
    nss: 'libnss',
    trashCli: 'trash-cli',
    uuid: 'libuuid',
    xcbDri3: 'libxcbdri3',
    xss: 'libxss',
    xtst: 'libxtst',
    xdgUtils: 'xdg-utils',
  };
  expectTypeOf(common.getATSPIDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getDRMDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getGBMDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getGConfDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getGTKDepends('8.0.0', dependencyMap)).toEqualTypeOf<string>();
  expectTypeOf(common.getTrashDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getUUIDDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getXcbDri3Depends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getXssDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(common.getXtstDepends('8.0.0', dependencyMap)).toEqualTypeOf<string[]>();
  expectTypeOf(
    common.mergeUserSpecified({ options: {} }, 'depends', { depends: ['a'] }),
  ).toEqualTypeOf<string[]>();
});

test('miscellaneous types', async () => {
  const packageJSON = {
    dependencies: {
      electron: '^8.0.0',
    },
  };
  expectTypeOf(
    common.getDefaultsFromPackageJSON(packageJSON),
  ).toEqualTypeOf<common.Configuration>();
  expectTypeOf(
    common.getDefaultsFromPackageJSON(packageJSON, { revision: 'revision' }),
  ).toEqualTypeOf<common.Configuration>();
  expectTypeOf(common.getHomePage(packageJSON)).toEqualTypeOf<string | undefined>();
  expectTypeOf(common.hasSandboxHelper('appDir')).toEqualTypeOf<Promise<boolean>>();
  expectTypeOf(await common.readElectronVersion('appDir')).toEqualTypeOf<string>();
  expectTypeOf(
    await common.readMetadata({
      src: 'src',
      logger: console.log,
    }),
  ).toEqualTypeOf<common.PackageJSON>();
  expectTypeOf(common.replaceScopeName('@foo/bar')).toEqualTypeOf<string>();
  expectTypeOf(common.replaceScopeName('@foo/bar', '_')).toEqualTypeOf<string>();
  expectTypeOf(common.sanitizeName('@foo/bar', 'a-z')).toEqualTypeOf<string>();
  expectTypeOf(common.sanitizeName('@foo/bar', 'a-z', '_')).toEqualTypeOf<string>();
  await common.updateSandboxHelperPermissions('appDir');
  expectTypeOf(common.wrapError('message')).toEqualTypeOf<common.CatchableFunction>();
  await common.wrapError('message', async () => Promise.resolve());
});
