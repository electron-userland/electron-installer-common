'use strict'

const { ElectronInstaller } = require('..')
const fs = require('fs-extra')
const path = require('path')
const test = require('ava')

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
    .then(() => installer.createStagingDir())
    .then(() => t.throwsAsync(installer.createBinarySymlink(), /could not find the Electron app binary/))
})
