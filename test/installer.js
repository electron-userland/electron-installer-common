'use strict'

const { createBinary } = require('..')
const fs = require('fs-extra')
const path = require('path')
const test = require('ava')
const tmp = require('tmp-promise')

test('createBinary creates symlink when bin exists', t => {
  const options = {
    bin: 'app-name',
    logger: log => log,
    name: 'bundled_app',
    src: path.join(__dirname, 'fixtures', 'bundled_app')
  }
  return tmp.dir({ prefix: 'electron-installer-common-', unsafeCleanup: true })
    .then(dir => {
      options.dest = dir.path
      return createBinary(options, options.dest)
    }).then(() => fs.lstat(path.join(options.dest, 'usr', 'bin', 'bundled_app')))
    .then(stats => t.true(stats.isSymbolicLink()))
})

test('createBinary does not create symlink when bin does not exist', t => {
  const options = {
    bin: 'nonexistent',
    logger: log => log,
    name: 'bundled_app',
    src: path.join(__dirname, 'fixtures', 'bundled_app')
  }
  return tmp.dir({ prefix: 'electron-installer-common-', unsafeCleanup: true })
    .then(dir => {
      return t.throwsAsync(createBinary(options, dir.path), /could not find the Electron app binary/)
    })
})
