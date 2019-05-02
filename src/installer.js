'use strict'

const _ = require('lodash')
const debug = require('debug')('electron-installer-common:installer')
const desktop = require('./desktop')
const error = require('./error')
const fs = require('fs-extra')
const glob = require('glob-promise')
const path = require('path')
const template = require('./template')
const tmp = require('tmp-promise')
const updateSandboxHelperPermissions = require('./sandboxhelper')

class ElectronInstaller {
  constructor (userSupplied) {
    this.userSupplied = userSupplied
  }

  get appIdentifier () {
    return this.options.name
  }

  get baseAppDir () {
    return 'usr'
  }

  /* istanbul ignore next */
  /**
   * A list of method names to run during `createContents()`.
   */
  get contentFunctions () {
    throw new Error('Please implement contentFunctions')
  }

  /* istanbul ignore next */
  /**
   * The path to the default .desktop file template.
   */
  get defaultDesktopTemplatePath () {
    throw new Error('Please implement defaultDesktopTemplatePath')
  }

  /**
   * The Linux pixmap icon path, relative to the `baseAppDir`.
   */
  get pixmapIconPath () {
    return path.join('share', 'pixmaps', `${this.appIdentifier}.png`)
  }

  get sourceDir () {
    return this.options.src
  }

  /**
   * The directory that the bundled application is copied to, relative to `stagingDir`.
   */
  get stagingAppDir () {
    return path.join(this.stagingDir, this.baseAppDir, 'lib', this.appIdentifier)
  }

  /**
   * Copies the bundled application into the staging directory.
   */
  copyApplication (ignoreFunc) {
    debug(`Copying application to ${this.stagingAppDir}`)

    return fs.ensureDir(this.stagingAppDir, '0755')
      .then(() => fs.copy(this.sourceDir, this.stagingAppDir, { filter: ignoreFunc }))
      .catch(error.wrapError('copying application directory'))
  }

  /**
   * Create hicolor icon for the package.
   */
  copyHicolorIcons () {
    return Promise.all(_.map(this.options.icon, (iconSrc, resolution) => {
      const iconExt = resolution === 'scalable' ? 'svg' : 'png'
      const iconFile = path.join(this.stagingDir, this.baseAppDir, 'share', 'icons', 'hicolor', resolution, 'apps', `${this.appIdentifier}.${iconExt}`)

      return this.copyIcon(iconSrc, iconFile)
        .catch(error.wrapError('creating hicolor icon file'))
    }))
  }

  /**
   * Generically copy an icon.
   */
  copyIcon (src, dest) {
    debug(`Copying icon file at from "${src}" to "${dest}"`)

    return fs.pathExists(src)
      .then(exists => {
        if (!exists) {
          throw new Error(`The icon "${src}" does not exist`)
        }
        return true
      }).then(() => fs.ensureDir(path.dirname(dest), '0755'))
      .then(() => fs.copy(src, dest))
      .then(() => fs.chmod(dest, '0644'))
  }

  /**
   * Copy `LICENSE` from the root of the app to a different location.
   */
  copyLicense (copyrightFile) {
    const licenseSrc = path.join(this.sourceDir, 'LICENSE')
    debug(`Copying license file from ${licenseSrc}`)

    return fs.copy(licenseSrc, copyrightFile)
  }

  /**
   * Copy icons into the appropriate locations on Linux.
   */
  copyLinuxIcons () {
    if (_.isObject(this.options.icon)) {
      return this.copyHicolorIcons()
    } else if (this.options.icon) {
      return this.copyPixmapIcon()
    }
  }

  /**
   * Create pixmap icon for the package.
   */
  copyPixmapIcon () {
    const iconFile = path.join(this.stagingDir, this.baseAppDir, this.pixmapIconPath)

    return this.copyIcon(this.options.icon, iconFile)
      .catch(error.wrapError('creating pixmap icon file'))
  }

  /**
   * Create the symlink to the binary for the package.
   */
  createBinarySymlink () {
    const binSrc = path.join('../lib', this.appIdentifier, this.options.bin)
    const binDest = path.join(this.stagingDir, this.baseAppDir, 'bin', this.appIdentifier)
    debug(`Symlinking binary from ${binSrc} to ${binDest}`)

    const bundledBin = path.join(this.sourceDir, this.options.bin)

    return fs.pathExists(bundledBin)
      .then(exists => {
        if (!exists) {
          throw new Error(`could not find the Electron app binary at "${bundledBin}". You may need to re-bundle the app using Electron Packager's "executableName" option.`)
        }
        return fs.ensureDir(path.dirname(binDest), '0755')
      }).then(() => fs.symlink(binSrc, binDest, 'file'))
      .catch(error.wrapError('creating binary symlink'))
  }

  /**
   * Generate the contents of the package in "parallel" by calling the methods specified in
   * `contentFunctions` getter through `Promise.all`.
   */
  createContents () {
    debug('Creating contents of package')

    return Promise.all(this.contentFunctions.map(func => this[func]()))
      .catch(error.wrapError('creating contents of package'))
  }

  /**
   * Create copyright for the package.
   */
  createCopyright () {
    const copyrightFile = path.join(this.stagingDir, this.baseAppDir, 'share', 'doc', this.appIdentifier, 'copyright')
    debug(`Creating copyright file at ${copyrightFile}`)

    return fs.ensureDir(path.dirname(copyrightFile), '0755')
      .then(() => this.copyLicense(copyrightFile))
      .then(() => fs.chmod(copyrightFile, '0644'))
      .catch(error.wrapError('creating copyright file'))
  }

  /**
   * Create the freedesktop.org .desktop file for the package.
   *
   * See: http://standards.freedesktop.org/desktop-entry-spec/latest/
   */
  createDesktopFile () {
    const templatePath = this.options.desktopTemplate || this.defaultDesktopTemplatePath
    const baseDir = path.join(this.stagingDir, this.baseAppDir, 'share', 'applications')
    return desktop.createDesktopFile(templatePath, baseDir, this.appIdentifier, this.options)
  }

  /**
   * Create temporary directory where the contents of the package will live.
   */
  createStagingDir () {
    debug('Creating staging directory')

    return tmp.dir({ prefix: 'electron-', unsafeCleanup: true })
      .then(dir => {
        this.stagingDir = path.join(dir.path, `${this.appIdentifier}_${this.options.version}_${this.options.arch}`)
        return fs.ensureDir(this.stagingDir, '0755')
      }).catch(error.wrapError('creating staging directory'))
  }

  createTemplatedFile (templatePath, dest, filePermissions) {
    return template.createTemplatedFile(templatePath, dest, this.options, filePermissions)
  }

  /**
   * Flattens and merges default values, CLI-supplied options, and API-supplied options.
   */
  generateOptions () {
    this.options = _.defaults({}, this.userSupplied, this.userSupplied.options, this.defaults)
  }

  /**
   * Move the package to the specified destination.
   */
  movePackage () {
    debug('Moving package to destination')

    return glob(this.packagePattern)
      .then(files => Promise.all(files.map(file => {
        const renameTemplate = this.options.rename(this.options.dest, path.basename(file))
        const dest = _.template(renameTemplate)(this.options)
        debug(`Moving file ${file} to ${dest}`)
        return fs.move(file, dest, { clobber: true })
      }))).catch(error.wrapError('moving package files'))
  }

  /**
   * For Electron versions that support the setuid sandbox on Linux, changes the permissions of
   * the `chrome-sandbox` executable as appropriate.
   */
  updateSandboxHelperPermissions () {
    return updateSandboxHelperPermissions(this.stagingAppDir)
  }
}

module.exports = ElectronInstaller
