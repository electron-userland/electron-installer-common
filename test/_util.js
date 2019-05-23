'use strict'

const fs = require('fs-extra')
const path = require('path')
const tmp = require('tmp-promise')

module.exports = {
  assertPathExists: async function assertPathExists (t, pathToCheck) {
    t.true(await fs.pathExists(pathToCheck), `File "${pathToCheck}" should exist`)
  },
  assertPathNotExists: async function assertPathExists (t, pathToCheck) {
    t.false(await fs.pathExists(pathToCheck), `File "${pathToCheck}" should not exist`)
  },
  assertPathPermissions: async function assertPathPermissions (t, pathToCheck, expectedPermissions) {
    const stats = await fs.stat(pathToCheck)
    const actual = stats.mode & 0o7777
    const msg = `Expected mode=${expectedPermissions.toString(8)}, got ${actual.toString(8)}`
    if (process.platform === 'win32') {
      t.true((actual & expectedPermissions) === expectedPermissions, msg)
    } else {
      t.is(actual, expectedPermissions, msg)
    }
  },
  assertTrimmedFileContents: async function assertTrimmedFileContents (t, filePath, expectedContents) {
    const data = await fs.readFile(filePath)
    t.is(data.toString().trim(), expectedContents)
  },
  SIMPLE_TEMPLATE_PATH: path.resolve(__dirname, 'fixtures', 'template', 'simple.ejs'),
  unsafeTempDir: function unsafeTempDir (promise) {
    return tmp.withDir(promise, { unsafeCleanup: true })
  }
}
