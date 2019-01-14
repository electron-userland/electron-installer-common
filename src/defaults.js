'use strict'

const getHomePage = require('./gethomepage')

module.exports = function getDefaultsFromPackageJSON (pkg) {
  return {
    arch: undefined,
    bin: pkg.name || 'electron',
    execArguments: [],
    categories: [
      'GNOME',
      'GTK',
      'Utility'
    ],
    description: pkg.description,
    genericName: pkg.genericName || pkg.productName || pkg.name,
    homepage: getHomePage(pkg),
    mimeType: [],
    name: pkg.name || 'electron',
    productDescription: pkg.productDescription || pkg.description,
    productName: pkg.productName || pkg.name,
    revision: pkg.revision || '1'
  }
}
