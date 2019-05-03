'use strict'

const dependencies = require('./dependencies')
const desktop = require('./desktop')
const ElectronInstaller = require('./installer')
const error = require('./error')
const getDefaultsFromPackageJSON = require('./defaults')
const getHomePage = require('./gethomepage')
const readElectronVersion = require('./readelectronversion')
const readMetadata = require('./readmetadata')
const replaceScopeName = require('./replacescopename')
const sanitizeName = require('./sanitizename')
const spawn = require('./spawn')
const template = require('./template')
const updateSandboxHelperPermissions = require('./sandboxhelper')

module.exports = {
  createDesktopFile: desktop.createDesktopFile,
  createTemplatedFile: template.createTemplatedFile,
  ElectronInstaller,
  errorMessage: error.errorMessage,
  generateTemplate: template.generateTemplate,
  getDefaultsFromPackageJSON,
  getDepends: dependencies.getDepends,
  getGConfDepends: dependencies.getGConfDepends,
  getGTKDepends: dependencies.getGTKDepends,
  getHomePage,
  getTrashDepends: dependencies.getTrashDepends,
  getUUIDDepends: dependencies.getUUIDDepends,
  mergeUserSpecified: dependencies.mergeUserSpecified,
  readElectronVersion,
  readMetadata,
  replaceScopeName,
  sanitizeName,
  spawn,
  updateSandboxHelperPermissions,
  wrapError: error.wrapError
}
