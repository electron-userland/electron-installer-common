import { cp, lstat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, vi } from 'vitest';
import { ElectronInstaller } from '../src/index.js';
import {
  assertPathExists,
  assertPathNotExists,
  assertPathPermissions,
  assertTrimmedFileContents,
  SIMPLE_TEMPLATE_PATH,
  unsafeTempDir,
} from './util.js';

const fixturesDir = path.join(import.meta.dirname, 'fixtures');

/**
 * Overrides a getter defined on the `ElectronInstaller` prototype with a stub value on the given
 * instance.
 */
function stubGetter(installer: ElectronInstaller, property: string, value: unknown): void {
  Object.defineProperty(installer, property, { configurable: true, get: () => value });
}

test('sourceDir usable before options are set', () => {
  const src = path.join(fixturesDir, 'app-with-asar');
  const installer = new ElectronInstaller({ name: 'copyapp', src });
  expect(installer.sourceDir).toBe(src);
  delete installer.userSupplied.src;
  installer.userSupplied.options = { src };
  expect(installer.sourceDir).toBe(src);
  delete installer.userSupplied.options;
  expect(installer.sourceDir).toBe(undefined);
});

test('copyApplication', async () => {
  const installer = new ElectronInstaller({
    name: 'copyapp',
    src: path.join(fixturesDir, 'app-with-asar'),
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.copyApplication();
  await assertPathExists(installer.stagingAppDir);
  await assertPathExists(path.join(installer.stagingAppDir, 'footest'));
});

test('copyApplication with ignore func', async () => {
  const installer = new ElectronInstaller({
    name: 'copyapp',
    src: path.join(fixturesDir, 'app-with-asar'),
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.copyApplication((src) => src !== path.join(installer.sourceDir!, 'LICENSE'));
  await assertPathExists(path.join(installer.stagingAppDir, 'footest'));
  await assertPathNotExists(path.join(installer.stagingAppDir, 'LICENSE'));
});

test('copyLinuxIcons for hicolor icons', async () => {
  const hicolorDir = path.join('usr', 'share', 'icons', 'hicolor');
  const img = path.join(fixturesDir, 'icon.fake');
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: {
      scalable: img,
      symbolic: img,
      '48x48': img,
    },
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.copyLinuxIcons();
  await assertPathExists(
    path.join(installer.stagingDir, hicolorDir, '48x48', 'apps', 'icontest.png'),
  );
  await assertPathExists(
    path.join(installer.stagingDir, hicolorDir, 'scalable', 'apps', 'icontest.svg'),
  );
  await assertPathExists(
    path.join(installer.stagingDir, hicolorDir, 'symbolic', 'apps', 'icontest-symbolic.svg'),
  );
});

test('copyLinuxIcons for pixmap', async () => {
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: path.join(fixturesDir, 'icon.fake'),
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.copyLinuxIcons();
  await assertPathExists(
    path.join(installer.stagingDir, 'usr', 'share', 'pixmaps', 'icontest.png'),
  );
});

test('copyLinuxIcon with a nonexistent source icon', async () => {
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: path.join(fixturesDir, 'icons', 'nonexistent.png'),
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await expect(installer.copyLinuxIcons()).rejects.toThrow(/The icon ".*" does not exist$/);
});

test('copyLinuxIcons does nothing if icon option not specified', async () => {
  const installer = new ElectronInstaller({ name: 'icontest' });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.copyLinuxIcons();
  await assertPathNotExists(path.join(installer.stagingDir, 'usr', 'share', 'pixmaps'));
  await assertPathNotExists(path.join(installer.stagingDir, 'usr', 'share', 'icons'));
});

test('createBinarySymlink creates symlink when bin exists', async () => {
  const options = {
    bin: 'app-name',
    logger: (log: string) => log,
    name: 'bundled_app',
    src: path.join(fixturesDir, 'bundled_app'),
  };
  const installer = new ElectronInstaller(options);
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.createBinarySymlink();
  const stats = await lstat(
    path.join(installer.stagingDir, installer.baseAppDir, 'bin', 'bundled_app'),
  );
  expect(stats.isSymbolicLink()).toBe(true);
});

test('createBinarySymlink does not create symlink when bin does not exist', async () => {
  const options = {
    bin: 'nonexistent',
    logger: (log: string) => log,
    name: 'bundled_app',
    src: path.join(fixturesDir, 'bundled_app'),
  };
  const installer = new ElectronInstaller(options);
  installer.generateOptions();
  await installer.createStagingDir();
  await expect(installer.createBinarySymlink()).rejects.toThrow(
    /could not find the Electron app binary/,
  );
});

test('createContents', async () => {
  const installer = new ElectronInstaller({ name: 'World' });
  const createFakeContent = vi.fn(async () => {});
  Object.assign(installer, { createFakeContent });
  stubGetter(installer, 'contentFunctions', ['createFakeContent']);
  await installer.createContents();
  expect(createFakeContent).toHaveBeenCalled();
});

test('createCopyright', () => {
  return unsafeTempDir(async (dir) => {
    const installer = new ElectronInstaller({ name: 'copyright-test', src: dir.path });
    installer.generateOptions();
    await installer.createStagingDir();
    await writeFile(path.join(dir.path, 'LICENSE'), 'License');
    await installer.createCopyright();
    await assertTrimmedFileContents(
      path.join(installer.stagingDir, 'usr', 'share', 'doc', 'copyright-test', 'copyright'),
      'License',
    );
  });
});

test('createDesktopFile with default template', async () => {
  const installer = new ElectronInstaller({ name: 'World' });
  stubGetter(installer, 'defaultDesktopTemplatePath', SIMPLE_TEMPLATE_PATH);
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.createDesktopFile();
  await assertPathExists(
    path.join(installer.stagingDir, 'usr', 'share', 'applications', 'World.desktop'),
  );
});

test('createDesktopFile with custom desktopTemplate', async () => {
  const installer = new ElectronInstaller({
    name: 'World',
    desktopTemplate: SIMPLE_TEMPLATE_PATH,
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.createDesktopFile();
  await assertPathExists(
    path.join(installer.stagingDir, 'usr', 'share', 'applications', 'World.desktop'),
  );
});

test('createDesktopFile with custom desktopId', async () => {
  const installer = new ElectronInstaller({
    name: 'World',
    desktopId: 'com.example.World',
    desktopTemplate: SIMPLE_TEMPLATE_PATH,
  });
  installer.generateOptions();
  await installer.createStagingDir();
  await installer.createDesktopFile();
  await assertPathExists(
    path.join(installer.stagingDir, 'usr', 'share', 'applications', 'com.example.World.desktop'),
  );
});

test('createTemplatedFile', () => {
  return unsafeTempDir(async (dir) => {
    const renderedPath = path.join(dir.path, 'rendered');
    const installer = new ElectronInstaller({ name: 'World' });
    installer.generateOptions();
    await installer.createTemplatedFile(SIMPLE_TEMPLATE_PATH, renderedPath);
    await assertTrimmedFileContents(renderedPath, 'Hello, World!');
  });
});

test('generateOptions merges default values & CLI options', () => {
  const installer = new ElectronInstaller({ options: { name: 'CLI' } });
  Object.assign(installer, { defaults: { name: 'Default', description: 'Default' } });
  installer.generateOptions();
  expect(installer.options.name).toBe('CLI');
  expect(installer.options.description).toBe('Default');
});

test('generateOptions merges API values & CLI options', () => {
  const installer = new ElectronInstaller({ name: 'API', options: { name: 'CLI' } });
  Object.assign(installer, { defaults: { name: 'Default' } });
  installer.generateOptions();
  expect(installer.options.name).toBe('API');
});

test('movePackage', () => {
  return unsafeTempDir(async (dir) => {
    const destDir = path.join(dir.path, 'moveTo');
    const rename = (dest: string, _src: string) => {
      return path.join(dest, 'test_<%= name %>.pkg');
    };
    const installer = new ElectronInstaller({ name: 'foo', dest: destDir, rename });
    installer.generateOptions();
    Object.assign(installer, { packagePattern: path.join(dir.path, '*.pkg') });
    await mkdir(destDir, { recursive: true });
    await writeFile(path.join(dir.path, 'test.pkg'), 'hello');
    await installer.movePackage();
    const expectedPackagePath = path.join(destDir, 'test_foo.pkg');
    expect(installer.options.packagePaths).toEqual([expectedPackagePath]);
    await assertPathExists(expectedPackagePath);
  });
});

test.runIf(process.platform !== 'win32')(
  'updateSandboxHelperPermissions with no sandbox does nothing',
  async () => {
    const installer = new ElectronInstaller({
      name: 'copyapp',
      src: path.join(fixturesDir, 'app-with-asar'),
    });
    installer.generateOptions();
    await installer.createStagingDir();
    await installer.copyApplication();
    await installer.updateSandboxHelperPermissions();
    await assertPathNotExists(path.join(installer.stagingAppDir, 'chrome-sandbox'));
  },
);

test.runIf(process.platform !== 'win32')(
  'updateSandboxHelperPermissions with sandbox chmods the sandbox file correctly',
  () => {
    return unsafeTempDir(async (dir) => {
      const originalFixturesDir = path.join(fixturesDir, 'app-with-asar');
      const copiedFixturesDir = path.join(dir.path, 'bundled_app');
      const chromeSandbox = 'chrome-sandbox';
      const installer = new ElectronInstaller({ name: 'copyapp', src: copiedFixturesDir });
      installer.generateOptions();
      await cp(originalFixturesDir, copiedFixturesDir, { recursive: true });
      await writeFile(path.join(copiedFixturesDir, chromeSandbox), '');
      await installer.createStagingDir();
      await installer.copyApplication();
      await installer.updateSandboxHelperPermissions();
      await assertPathPermissions(path.join(installer.stagingAppDir, chromeSandbox), 0o4755);
    });
  },
);
