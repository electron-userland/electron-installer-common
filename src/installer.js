'use strict'

const _ = require('lodash')
const debug = require('debug')('electron-installer-common:installer')
const error = require('./error')
const glob = require('glob-promise')
const fs = require('fs-extra')
const path = require('path')
const tmp = require('tmp-promise')

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

  /**
   * A list of method names to run during `createContents()`.
   */
  get contentFunctions () {
    throw new Error('Please implement contentFunctions')
  }

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

    return fs.ensureDir(path.dirname(dest), '0755')
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
    } else {
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
    const src = this.options.desktopTemplate || this.defaultDesktopTemplatePath
    const dest = path.join(this.stagingDir, this.baseAppDir, 'share', 'applications', `${this.appIdentifier}.desktop`)
    debug(`Creating desktop file at ${dest}`)

    return this.createTemplatedFile(src, dest, '0644')
      .catch(error.wrapError('creating desktop file'))
  }

  /**
   * Create temporary directory where the contents of the package will live.
   */
  createStagingDir () {
    debug('Creating staging directory')

    return tmp.dir({ prefix: 'electron-', unsafeCleanup: true })
      .catch(error.wrapError('creating temporary directory'))
      .then(dir => {
        this.stagingDir = path.join(dir.path, `${this.appIdentifier}_${this.options.version}_${this.options.arch}`)
        return fs.ensureDir(this.stagingDir, '0755')
      }).catch(error.wrapError('changing permissions on temporary directory'))
  }

  createTemplatedFile (templatePath, dest, permissions) {
    return fs.ensureDir(path.dirname(dest), '0755')
      .then(() => this.generateTemplate(templatePath))
      .then(data => fs.outputFile(dest, data))
      .then(() => {
        if (permissions) {
          return fs.chmod(dest, permissions)
        }
        return Promise.resolve()
      })
  }

  /**
   * Flattens and merges default values, CLI-supplied options, and API-supplied options.
   */
  generateOptions () {
    this.options = _.defaults({}, this.userSupplied, this.userSupplied.options, this.defaults)
  }

  /**
   * Fill in a template with the hash of options.
   */
  generateTemplate (file, options) {
    debug(`Generating template from ${file}`)
    options = options || this.options

    return fs.readFile(file)
      .then(template => {
        const result = _.template(template)(options)
        debug(`Generated template from ${file}\n${result}`)
        return result
      })
  }

  /**
   * Move the package to the specified destination.
   */
  movePackage () {
    debug('Moving package to destination')

    return glob(this.packagePattern)
      .then(files => Promise.all(files.map(file => {
        const template = this.options.rename(this.options.dest, path.basename(file))
        const dest = _.template(template)(this.options)
        debug(`Moving file ${file} to ${dest}`)
        return fs.move(file, dest, { clobber: true })
      }))).catch(error.wrapError('moving package files'))
  }
}

module.exports = ElectronInstaller
