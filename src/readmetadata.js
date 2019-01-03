'use strict'

const asar = require('asar')
const fs = require('fs-extra')
const path = require('path')
const { wrapError } = require('./error')

function readPackageJSONFromUnpackedApp (options) {
  const appPackageJSONPath = path.join(options.src, 'resources', 'app', 'package.json')
  options.logger(`Reading package metadata from ${appPackageJSONPath}`)

  return fs.readJson(appPackageJSONPath)
    .catch(err => {
      throw new Error(`Could not find, read, or parse package.json in packaged app '${options.src}':\n${err.message}`)
    })
}

/**
 * Read `package.json` either from `resources/app.asar` (if the app is packaged)
 * or from `resources/app/package.json` (if it is not).
 *
 * Options used:
 *
 * * `src`: the directory containing the bundled app
 * * `logger`: function that handles debug messages, e.g.,
 *             `debug('electron-installer-something:some-module')`
 */
module.exports = function readMetadata (options) {
  const appAsarPath = path.join(options.src, 'resources/app.asar')

  return fs.pathExists(appAsarPath)
    .then(asarExists => {
      if (asarExists) {
        options.logger(`Reading package metadata from ${appAsarPath}`)
        return JSON.parse(asar.extractFile(appAsarPath, 'package.json'))
      } else {
        return readPackageJSONFromUnpackedApp(options)
      }
    }).catch(wrapError('reading package metadata'))
}
