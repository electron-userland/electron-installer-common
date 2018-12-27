'use strict'

const _ = require('lodash')
const semver = require('semver')

/**
 * Determine whether GConf is a necessary dependency, given the Electron version.
 */
function getGConfDepends (version, dependencyMap) {
  return semver.lt(version, '3.0.0-beta.1') ? [dependencyMap.gconf] : []
}

/**
 * Determine the GTK dependency based on the Electron version in use.
 */
function getGTKDepends (version, dependencyMap) {
  return semver.gte(version, '2.0.0-beta.1') ? dependencyMap.gtk3 : dependencyMap.gtk2
}

/**
 * Determine the dependencies for the `shell.moveItemToTrash` Electron API, based on the
 * Electron version in use.
 *
 * @return {string[]} an ordered list of dependencies that are OR'd together by the installer module.
 */
function getTrashDepends (version, dependencyMap) {
  if (semver.lt(version, '1.4.1')) {
    return [dependencyMap.gvfs]
  } else if (semver.lt(version, '1.7.2')) {
    return [dependencyMap.kdeCliTools, dependencyMap.kdeRuntime, dependencyMap.trashCli, dependencyMap.gvfs]
  } else {
    return [dependencyMap.kdeCliTools, dependencyMap.kdeRuntime, dependencyMap.trashCli, dependencyMap.glib2, dependencyMap.gvfs]
  }
}

/**
 * Determine whether libuuid is necessary, given the Electron version.
 */
function getUUIDDepends (version, dependencyMap) {
  return semver.gte(version, '4.0.0-beta.1') ? [dependencyMap.uuid] : []
}

module.exports = {
  /**
   * Determine the default dependencies for an Electron application.
   */
  getDepends: function getDepends (version, dependencyMap) {
    return [
      getGTKDepends(version, dependencyMap),
      dependencyMap.notify,
      dependencyMap.nss,
      dependencyMap.xss,
      dependencyMap.xtst,
      dependencyMap.xdgUtils
    ].concat(getGConfDepends(version, dependencyMap))
      .concat(getUUIDDepends(version, dependencyMap))
  },
  getGConfDepends: getGConfDepends,
  getGTKDepends: getGTKDepends,
  getTrashDepends: getTrashDepends,
  getUUIDDepends: getUUIDDepends,

  /**
   * Merge the user specified dependencies (from either the API or the CLI) with the respective
   * default dependencies, given the `dependencyKey`.
   *
   * @param {object} data - the user-specified data
   * @param {string} dependencyKey - the dependency type (e.g., `depends` for Debian
   * runtime dependencies)
   * @param {object} defaults - the default options for the installer module
   *
   */
  mergeUserSpecified: function mergeUserSpecified (data, dependencyKey, defaults) {
    if (data.options) { // options passed programmatically
      return _.union(defaults[dependencyKey], data.options[dependencyKey])
    } else { // options passed via command-line
      return _.union(defaults[dependencyKey], data[dependencyKey])
    }
  }
}
