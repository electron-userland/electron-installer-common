import * as common from '..';
import { expectType } from 'tsd';

const installer = new common.ElectronInstaller({});
await installer.copyApplication(async() => true);
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
await installer.createTemplatedFile();
installer.generateOptions();
await installer.movePackage();
await installer.updateSandboxHelperPermissions();

await common.createDesktopFile('template', 'dir', 'baseName', { foo: 'bar' });
await common.createTemplatedFile('template', 'destDir', { foo: 'bar' }, 0o644);
expectType<string>(common.errorMessage('message', new Error('test')));
expectType<string>(await common.generateTemplate('template', { foo: 'bar' }));
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
  xdgUtils: 'xdg-utils'
};
expectType<string[]>(common.getATSPIDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getDRMDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getGBMDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getGConfDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getGTKDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getTrashDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getUUIDDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getXcbDri3Depends('8.0.0', dependencyMap));
expectType<string[]>(common.getXssDepends('8.0.0', dependencyMap));
expectType<string[]>(common.getXtstDepends('8.0.0', dependencyMap));
const packageJSON = {
  dependencies: {
    electron: '^8.0.0'
  }
};
expectType<common.Configuration>(common.getDefaultsFromPackageJSON(packageJSON));
expectType<common.Configuration>(common.getDefaultsFromPackageJSON(packageJSON, { revision: 'revision' }));
expectType<boolean>(common.hasSandboxHelper('appDir'));
expectType<Record<string, unknown>>(common.mergeUserSpecified({ options: {} }, 'depends', { depends: ['a'] }));
expectType<string>(await common.readElectronVersion('appDir'));
expectType<common.PackageJSON>(await common.readMetadata({
  src: 'src',
  logger: console.log
}));
expectType<string>(common.replaceScopeName('@foo/bar'));
expectType<string>(common.replaceScopeName('@foo/bar', '_'));
expectType<string>(common.sanitizeName('@foo/bar', 'a-z'));
expectType<string>(common.sanitizeName('@foo/bar', 'a-z', '_'));
await common.updateSandboxHelperPermissions('appDir');
expectType<common.CatchableFunction>(common.wrapError('message'));
await common.wrapError('message', async() => Promise.resolve());
