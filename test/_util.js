'use strict'

const fs = require('fs-extra')
const path = require('path')
const tmp = require('tmp-promise')

module.exports = {
  assertPathExists: function assertPathExists (t, pathToCheck) {
    return fs.pathExists(pathToCheck)
      .then(exists => t.true(exists, `File "${pathToCheck}" should exist`))
  },
  assertPathNotExists: function assertPathExists (t, pathToCheck) {
    return fs.pathExists(pathToCheck)
      .then(exists => t.false(exists, `File "${pathToCheck}" should not exist`))
  },
  assertPathPermissions: function assertPathPermissions (t, pathToCheck, expectedPermissions) {
    return fs.stat(pathToCheck)
      .then(stats => t.is(stats.mode & 0o7777, expectedPermissions))
  },
  assertTrimmedFileContents: function assertTrimmedFileContents (t, filePath, expectedContents) {
    return fs.readFile(filePath)
      .then(data => t.is(data.toString().trim(), expectedContents))
  },
  SIMPLE_TEMPLATE_PATH: path.resolve(__dirname, 'fixtures', 'template', 'simple.ejs'),
  unsafeTempDir: function unsafeTempDir (promise) {
    return tmp.withDir(promise, { unsafeCleanup: true })
  }
}
