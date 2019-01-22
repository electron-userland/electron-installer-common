'use strict'

const { ElectronInstaller } = require('..')
const fs = require('fs-extra')
const path = require('path')
const sinon = require('sinon')
const test = require('ava')
const util = require('./_util')

test('copyApplication', t => {
  const installer = new ElectronInstaller({ name: 'copyapp', src: path.join(__dirname, 'fixtures', 'app-with-asar') })
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.copyApplication())
    .then(() => util.assertPathExists(t, installer.stagingAppDir))
    .then(() => util.assertPathExists(t, path.join(installer.stagingAppDir, 'footest')))
})

test('copyApplication with ignore func', t => {
  const installer = new ElectronInstaller({ name: 'copyapp', src: path.join(__dirname, 'fixtures', 'app-with-asar') })
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.copyApplication(src => src !== path.join(installer.sourceDir, 'LICENSE')))
    .then(() => util.assertPathExists(t, path.join(installer.stagingAppDir, 'footest')))
    .then(() => util.assertPathNotExists(t, path.join(installer.stagingAppDir, 'LICENSE')))
})

test('copyLinuxIcons for hicolor icons', t => {
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
  return installer.createStagingDir()
    .then(() => installer.copyLinuxIcons())
    .then(() => util.assertPathExists(t, path.join(installer.stagingDir, hicolorDir, '48x48', 'apps', 'icontest.png')))
    .then(() => util.assertPathExists(t, path.join(installer.stagingDir, hicolorDir, 'scalable', 'apps', 'icontest.svg')))
})

test('copyLinuxIcons for pixmap', t => {
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: path.join(__dirname, 'fixtures', 'icon.fake')
  })
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.copyLinuxIcons())
    .then(() => util.assertPathExists(t, path.join(installer.stagingDir, 'usr', 'share', 'pixmaps', 'icontest.png')))
})

test('copyLinuxIcon with a nonexistent source icon', t => {
  const installer = new ElectronInstaller({
    name: 'icontest',
    icon: path.join(__dirname, 'fixtures', 'icons', 'nonexistent.png')
  })
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => t.throwsAsync(installer.copyLinuxIcons(), /The icon ".*" does not exist$/))
})

test('copyLinuxIcons does nothing if icon option not specified', t => {
  const installer = new ElectronInstaller({ name: 'icontest' })
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.copyLinuxIcons())
    .then(() => util.assertPathNotExists(t, path.join(installer.stagingDir, 'usr', 'share', 'pixmaps')))
    .then(() => util.assertPathNotExists(t, path.join(installer.stagingDir, 'usr', 'share', 'icons')))
})

test('createBinarySymlink creates symlink when bin exists', t => {
  const options = {
    bin: 'app-name',
    logger: log => log,
    name: 'bundled_app',
    src: path.join(__dirname, 'fixtures', 'bundled_app')
  }
  const installer = new ElectronInstaller(options)
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.createBinarySymlink())
    .then(() => fs.lstat(path.join(installer.stagingDir, installer.baseAppDir, 'bin', 'bundled_app')))
    .then(stats => t.true(stats.isSymbolicLink()))
})

test('createBinarySymlink does not create symlink when bin does not exist', t => {
  const options = {
    bin: 'nonexistent',
    logger: log => log,
    name: 'bundled_app',
    src: path.join(__dirname, 'fixtures', 'bundled_app')
  }
  const installer = new ElectronInstaller(options)
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => t.throwsAsync(installer.createBinarySymlink(), /could not find the Electron app binary/))
})

test('createContents', t => {
  const installer = new ElectronInstaller({ name: 'World' })
  installer.createFakeContent = sinon.spy()
  sinon.stub(installer, 'contentFunctions').get(() => ['createFakeContent'])
  return installer.createContents()
    .then(() => t.true(installer.createFakeContent.called))
})

test('createCopyright', t => {
  return util.unsafeTempDir(dir => {
    const installer = new ElectronInstaller({ name: 'copyright-test', src: dir.path })
    installer.generateOptions()
    return installer.createStagingDir()
      .then(() => fs.outputFile(path.join(dir.path, 'LICENSE'), 'License'))
      .then(() => installer.createCopyright())
      .then(() => util.assertTrimmedFileContents(t, path.join(installer.stagingDir, 'usr', 'share', 'doc', 'copyright-test', 'copyright'), 'License'))
  })
})

test('createDesktopFile with default template', t => {
  const installer = new ElectronInstaller({ name: 'World' })
  sinon.stub(installer, 'defaultDesktopTemplatePath').get(() => util.SIMPLE_TEMPLATE_PATH)
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.createDesktopFile())
    .then(() => util.assertPathExists(t, path.join(installer.stagingDir, 'usr', 'share', 'applications', 'World.desktop')))
})

test('createDesktopFile with custom desktopTemplate', t => {
  const installer = new ElectronInstaller({ name: 'World', desktopTemplate: util.SIMPLE_TEMPLATE_PATH })
  installer.generateOptions()
  return installer.createStagingDir()
    .then(() => installer.createDesktopFile())
    .then(() => util.assertPathExists(t, path.join(installer.stagingDir, 'usr', 'share', 'applications', 'World.desktop')))
})

test('createTemplatedFile', t => {
  return util.unsafeTempDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    const installer = new ElectronInstaller({ name: 'World' })
    installer.generateOptions()
    return installer.createTemplatedFile(util.SIMPLE_TEMPLATE_PATH, renderedPath)
      .then(() => util.assertTrimmedFileContents(t, renderedPath, 'Hello, World!'))
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
  return util.unsafeTempDir(dir => {
    const destDir = path.join(dir.path, 'moveTo')
    const rename = (dest, src) => {
      return path.join(dest, 'test_<%= name %>.pkg')
    }
    const installer = new ElectronInstaller({ name: 'foo', dest: destDir, rename: rename })
    installer.generateOptions()
    installer.packagePattern = path.join(dir.path, '*.pkg')
    return fs.ensureDir(destDir)
      .then(() => fs.outputFile(path.join(dir.path, 'test.pkg'), 'hello'))
      .then(() => installer.movePackage())
      .then(() => util.assertPathExists(t, path.join(destDir, 'test_foo.pkg')))
  })
})
