'use strict'

const { ElectronInstaller } = require('..')
const fs = require('fs-extra')
const path = require('path')
const sinon = require('sinon')
const test = require('ava')
const util = require('./_util')

test('copyApplication', async t => {
  const installer = new ElectronInstaller({ name: 'copyapp', src: path.join(__dirname, 'fixtures', 'app-with-asar') })
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.copyApplication()
  await util.assertPathExists(t, installer.stagingAppDir)
  await util.assertPathExists(t, path.join(installer.stagingAppDir, 'footest'))
})

test('copyApplication with ignore func', async t => {
  const installer = new ElectronInstaller({ name: 'copyapp', src: path.join(__dirname, 'fixtures', 'app-with-asar') })
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.copyApplication(src => src !== path.join(installer.sourceDir, 'LICENSE'))
  await util.assertPathExists(t, path.join(installer.stagingAppDir, 'footest'))
  await util.assertPathNotExists(t, path.join(installer.stagingAppDir, 'LICENSE'))
})

test('copyLinuxIcons for hicolor icons', async t => {
  const hicolorDir = path.join('usr', 'share', 'icons', 'hicolor')
  const img = path.join(__dirname, 'fixtures', 'icon.fake')
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: {
      scalable: img,
      '48x48': img
    }
  })
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.copyLinuxIcons()
  await util.assertPathExists(t, path.join(installer.stagingDir, hicolorDir, '48x48', 'apps', 'icontest.png'))
  await util.assertPathExists(t, path.join(installer.stagingDir, hicolorDir, 'scalable', 'apps', 'icontest.svg'))
})

test('copyLinuxIcons for pixmap', async t => {
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: path.join(__dirname, 'fixtures', 'icon.fake')
  })
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.copyLinuxIcons()
  await util.assertPathExists(t, path.join(installer.stagingDir, 'usr', 'share', 'pixmaps', 'icontest.png'))
})

test('copyLinuxIcon with a nonexistent source icon', async t => {
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: path.join(__dirname, 'fixtures', 'icons', 'nonexistent.png')
  })
  installer.generateOptions()
  await installer.createStagingDir()
  await t.throwsAsync(installer.copyLinuxIcons(), /The icon ".*" does not exist$/)
})

test('copyLinuxIcons does nothing if icon option not specified', async t => {
  const installer = new ElectronInstaller({ name: 'icontest' })
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.copyLinuxIcons()
  await util.assertPathNotExists(t, path.join(installer.stagingDir, 'usr', 'share', 'pixmaps'))
  await util.assertPathNotExists(t, path.join(installer.stagingDir, 'usr', 'share', 'icons'))
})

test('createBinarySymlink creates symlink when bin exists', async t => {
  const options = {
    bin: 'app-name',
    logger: log => log,
    name: 'bundled_app',
    src: path.join(__dirname, 'fixtures', 'bundled_app')
  }
  const installer = new ElectronInstaller(options)
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.createBinarySymlink()
  const stats = await fs.lstat(path.join(installer.stagingDir, installer.baseAppDir, 'bin', 'bundled_app'))
  t.true(stats.isSymbolicLink())
})

test('createBinarySymlink does not create symlink when bin does not exist', async t => {
  const options = {
    bin: 'nonexistent',
    logger: log => log,
    name: 'bundled_app',
    src: path.join(__dirname, 'fixtures', 'bundled_app')
  }
  const installer = new ElectronInstaller(options)
  installer.generateOptions()
  await installer.createStagingDir()
  await t.throwsAsync(installer.createBinarySymlink(), /could not find the Electron app binary/)
})

test('createContents', async t => {
  const installer = new ElectronInstaller({ name: 'World' })
  installer.createFakeContent = sinon.spy()
  sinon.stub(installer, 'contentFunctions').get(() => ['createFakeContent'])
  await installer.createContents()
  await t.true(installer.createFakeContent.called)
})

test('createCopyright', t => {
  return util.unsafeTempDir(async dir => {
    const installer = new ElectronInstaller({ name: 'copyright-test', src: dir.path })
    installer.generateOptions()
    await installer.createStagingDir()
    await fs.outputFile(path.join(dir.path, 'LICENSE'), 'License')
    await installer.createCopyright()
    await util.assertTrimmedFileContents(t, path.join(installer.stagingDir, 'usr', 'share', 'doc', 'copyright-test', 'copyright'), 'License')
  })
})

test('createDesktopFile with default template', async t => {
  const installer = new ElectronInstaller({ name: 'World' })
  sinon.stub(installer, 'defaultDesktopTemplatePath').get(() => util.SIMPLE_TEMPLATE_PATH)
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.createDesktopFile()
  await util.assertPathExists(t, path.join(installer.stagingDir, 'usr', 'share', 'applications', 'World.desktop'))
})

test('createDesktopFile with custom desktopTemplate', async t => {
  const installer = new ElectronInstaller({ name: 'World', desktopTemplate: util.SIMPLE_TEMPLATE_PATH })
  installer.generateOptions()
  await installer.createStagingDir()
  await installer.createDesktopFile()
  await util.assertPathExists(t, path.join(installer.stagingDir, 'usr', 'share', 'applications', 'World.desktop'))
})

test('createTemplatedFile', t => {
  return util.unsafeTempDir(async dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    const installer = new ElectronInstaller({ name: 'World' })
    installer.generateOptions()
    await installer.createTemplatedFile(util.SIMPLE_TEMPLATE_PATH, renderedPath)
    await util.assertTrimmedFileContents(t, renderedPath, 'Hello, World!')
  })
})

test('generateOptions merges default values & CLI options', t => {
  const installer = new ElectronInstaller({ options: { name: 'CLI' } })
  installer.defaults = { name: 'Default', description: 'Default' }
  installer.generateOptions()
  t.is(installer.options.name, 'CLI')
  t.is(installer.options.description, 'Default')
})

test('generateOptions merges API values & CLI options', t => {
  const installer = new ElectronInstaller({ name: 'API', options: { name: 'CLI' } })
  installer.defaults = { name: 'Default' }
  installer.generateOptions()
  t.is(installer.options.name, 'API')
})

test('movePackage', t => {
  return util.unsafeTempDir(async dir => {
    const destDir = path.join(dir.path, 'moveTo')
    const rename = (dest, src) => {
      return path.join(dest, 'test_<%= name %>.pkg')
    }
    const installer = new ElectronInstaller({ name: 'foo', dest: destDir, rename: rename })
    installer.generateOptions()
    installer.packagePattern = path.join(dir.path, '*.pkg')
    await fs.ensureDir(destDir)
    await fs.outputFile(path.join(dir.path, 'test.pkg'), 'hello')
    await installer.movePackage()
    await util.assertPathExists(t, path.join(destDir, 'test_foo.pkg'))
  })
})

if (process.platform !== 'win32') {
  test('updateSandboxHelperPermissions with no sandbox does nothing', async t => {
    const installer = new ElectronInstaller({ name: 'copyapp', src: path.join(__dirname, 'fixtures', 'app-with-asar') })
    installer.generateOptions()
    await installer.createStagingDir()
    await installer.copyApplication()
    await installer.updateSandboxHelperPermissions()
    await util.assertPathNotExists(t, path.join(installer.stagingAppDir, 'chrome-sandbox'))
  })

  test('updateSandboxHelperPermissions with sandbox chmods the sandbox file correctly', t => {
    return util.unsafeTempDir(async dir => {
      const originalFixturesDir = path.join(__dirname, 'fixtures', 'app-with-asar')
      const copiedFixturesDir = path.join(dir.path, 'bundled_app')
      const chromeSandbox = 'chrome-sandbox'
      const installer = new ElectronInstaller({ name: 'copyapp', src: copiedFixturesDir })
      installer.generateOptions()
      await fs.copy(originalFixturesDir, copiedFixturesDir)
      await fs.outputFile(path.join(copiedFixturesDir, chromeSandbox), '')
      await installer.createStagingDir()
      await installer.copyApplication()
      await installer.updateSandboxHelperPermissions()
      await util.assertPathPermissions(t, path.join(installer.stagingAppDir, chromeSandbox), 0o4755)
    })
  })
}
