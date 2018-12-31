const dependencies = require('./dependencies')
const installer = require('./installer')
const spawn = require('./spawn')
const replaceScopeName = require('./replacescopename')
const readElectronVersion = require('./readelectronversion')

module.exports = {
  common: installer,
  mergeUserSpecified: dependencies.mergeUserSpecified,
  getDepends: dependencies.getDepends,
  getTrashDepends: dependencies.getTrashDepends,
  readElectronVersion: readElectronVersion,
  replaceScopeName: replaceScopeName,
  spawn: spawn
}
