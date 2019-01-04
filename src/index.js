'use strict'

const _ = require('lodash')
const dependencies = require('./dependencies')
const error = require('./error')
const fs = require('fs-extra')
const getHomePage = require('./gethomepage')
const glob = require('glob-promise')
const path = require('path')
const readElectronVersion = require('./readelectronversion')
const readMetadata = require('./readmetadata')
const replaceScopeName = require('./replacescopename')
const sanitizeName = require('./sanitizename')
const spawn = require('./spawn')
const tmp = require('tmp-promise')

/**
 * Copy `LICENSE` from the root of the app to a different location.
 */
function copyLicense (options, copyrightFile) {
  const licenseSrc = path.join(options.src, 'LICENSE')
  options.logger(`Copying license file from ${licenseSrc}`)

  return fs.copy(licenseSrc, copyrightFile)
}

/**
 * Create hicolor icon for the package.
 */
function createHicolorIcon (options, dir, hicolorBaseDir) {
  const hicolorDir = destinationDir('usr/share/icons/hicolor', hicolorBaseDir)
  return Promise.all(_.map(options.icon, (icon, resolution) => {
    const iconExt = resolution === 'scalable' ? 'svg' : 'png'
    const iconFile = path.join(dir, hicolorDir, resolution, 'apps', `${options.name}.${iconExt}`)
    options.logger(`Creating icon file at ${iconFile}`)

    return fs.ensureDir(path.dirname(iconFile), '0755')
      .then(() => fs.copy(icon, iconFile))
      .then(() => fs.chmod(iconFile, '0644'))
      .catch(error.wrapError('creating hicolor icon file'))
  }))
}

/**
 * Create pixmap icon for the package.
 */
function createPixmapIcon (options, dir, pixmapsBaseDir) {
  const pixmapsDir = destinationDir('usr/share/pixmaps', pixmapsBaseDir)
  const iconFile = path.join(dir, pixmapsDir, `${options.name}.png`)
  options.logger(`Creating icon file at ${iconFile}`)

  return fs.ensureDir(path.dirname(iconFile), '0755')
    .catch(error.wrapError('creating icon path'))
    .then(() => fs.copy(options.icon, iconFile))
    .then(() => fs.chmod(iconFile, '0644'))
    .catch(error.wrapError('creating icon file'))
}

function destinationDir (dir, baseDir) {
  return baseDir ? path.join(baseDir, dir) : dir
}

/**
 * Fill in a template with the hash of options.
 */
function generateTemplate (options, file) {
  options.logger(`Generating template from ${file}`)

  return fs.readFile(file)
    .then(template => {
      const result = _.template(template)(options)
      options.logger(`Generated template from ${file}\n${result}`)
      return result
    })
}

module.exports = {
  /**
   * Copies the bundled application into the lib directory.
   */
  copyApplication: function copyApplication (options, dir, baseAppDir, ignoreFunc) {
    const applicationDir = path.join(dir, destinationDir('usr/lib', baseAppDir), options.name)
    options.logger(`Copying application to ${applicationDir}`)

    return fs.ensureDir(applicationDir, '0755')
      .then(() => fs.copy(options.src, applicationDir, { filter: ignoreFunc }))
      .catch(error.wrapError('copying application directory'))
  },
  /**
   * Create the symlink to the binary for the package.
   */
  createBinary: function createBinary (options, dir, baseBinDir) {
    const binDir = path.join(dir, destinationDir('usr/bin', baseBinDir))
    const binSrc = path.join('../lib', options.name, options.bin)
    const binDest = path.join(binDir, options.name)
    options.logger(`Symlinking binary from ${binSrc} to ${binDest}`)

    const bundledBin = path.join(options.src, options.bin)

    return fs.pathExists(bundledBin)
      .then(exists => {
        if (!exists) {
          throw new Error(`could not find the Electron app binary at "${bundledBin}". You may need to re-bundle the app using Electron Packager's "executableName" option.`)
        }
        return fs.ensureDir(binDir, '0755')
      }).then(() => fs.symlink(binSrc, binDest, 'file'))
      .catch(error.wrapError('creating binary symlink'))
  },
  createContents: function createContents (options, dir, functions) {
    options.logger('Creating contents of package')

    return Promise.all(functions.map(func => func(options, dir)))
      .then(() => dir)
      .catch(error.wrapError('creating contents of package'))
  },
  /**
   * Create copyright for the package.
   */
  createCopyright: function createCopyright (options, dir, baseDocDir) {
    const docDir = destinationDir('usr/share/doc', baseDocDir)
    const copyrightFile = path.join(dir, docDir, options.name, 'copyright')
    options.logger(`Creating copyright file at ${copyrightFile}`)

    return fs.ensureDir(path.dirname(copyrightFile), '0755')
      .then(() => copyLicense(options, copyrightFile))
      .then(() => fs.chmod(copyrightFile, '0644'))
      .catch(error.wrapError('creating copyright file'))
  },
  /**
   * Create the desktop file for the package.
   *
   * See: http://standards.freedesktop.org/desktop-entry-spec/latest/
   */
  createDesktop: function createDesktop (options, dir, desktopSrc, applicationsBaseDir) {
    const applicationsDir = destinationDir('usr/share/applications', applicationsBaseDir)
    const desktopDest = path.join(dir, applicationsDir, `${options.name}.desktop`)
    options.logger(`Creating desktop file at ${desktopDest}`)

    return fs.ensureDir(path.dirname(desktopDest), '0755')
      .catch(error.wrapError('creating desktop path'))
      .then(() => generateTemplate(options, desktopSrc))
      .then(data => fs.outputFile(desktopDest, data))
      .then(() => fs.chmod(desktopDest, '0644'))
      .catch(error.wrapError('creating desktop file'))
  },
  /**
   * Create temporary directory where the contents of the package will live.
   */
  createDir: function createDir (options) {
    options.logger('Creating temporary directory')

    return tmp.dir({ prefix: 'electron-', unsafeCleanup: true })
      .catch(error.wrapError('creating temporary directory'))
      .then(dir => {
        const tempDir = path.join(dir.path, `${options.name}_${options.version}_${options.arch}`)
        return fs.ensureDir(tempDir, '0755')
      }).catch(error.wrapError('changing permissions on temporary directory'))
  },

  /**
   * Create icon for the package.
   */
  createIcon: function createIcon (options, dir, baseIconDir) {
    if (_.isObject(options.icon)) {
      return createHicolorIcon(options, dir, baseIconDir)
    } else {
      return createPixmapIcon(options, dir, baseIconDir)
    }
  },
  errorMessage: error.errorMessage,
  generateTemplate: generateTemplate,
  getDefaultsFromPackageJSON: function getDefaultsFromPackageJSON (pkg) {
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
  },
  getDepends: dependencies.getDepends,
  getGConfDepends: dependencies.getGConfDepends,
  getGTKDepends: dependencies.getGTKDepends,
  getTrashDepends: dependencies.getTrashDepends,
  getUUIDDepends: dependencies.getUUIDDepends,
  mergeUserSpecified: dependencies.mergeUserSpecified,
  /**
   * Move the package to the specified destination.
   */
  movePackage: function movePackage (packagePattern, options, dir) {
    options.logger('Moving package to destination')

    return glob(packagePattern)
      .then(files => Promise.all(files.map(file => {
        const template = options.rename(options.dest, path.basename(file))
        const dest = _.template(template)(options)
        options.logger(`Moving file ${file} to ${dest}`)
        return fs.move(file, dest, { clobber: true })
      }))).catch(error.wrapError('moving package files'))
  },
  readElectronVersion: readElectronVersion,
  readMeta: readMetadata,
  replaceScopeName: replaceScopeName,
  sanitizeName: sanitizeName,
  spawn: spawn,
  wrapError: error.wrapError
}
