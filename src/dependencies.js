'use strict'

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
 * Determine the dependencies for the `shell.moveItemToTrash` API, based on the
 * Electron version in use.
 */
function getTrashDepends (version, dependencyMap) {
  if (semver.lt(version, '1.4.1')) {
    return dependencyMap.gvfs
  } else if (semver.lt(version, '1.7.2')) {
    return `${dependencyMap.kdeCliTools} | ${dependencyMap.kdeRuntime} | ${dependencyMap.trashCli} | ${dependencyMap.gvfs}`
  } else {
    return `${dependencyMap.kdeCliTools} | ${dependencyMap.kdeRuntime} | ${dependencyMap.trashCli} | ${dependencyMap.glib2} | ${dependencyMap.gvfs}`
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
      getTrashDepends(version, dependencyMap),
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
  getUUIDDepends: getUUIDDepends
}
