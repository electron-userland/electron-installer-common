'use strict'

const _ = require('lodash')
const debug = require('debug')('electron-installer-common:template')
const fs = require('fs-extra')
const path = require('path')

/**
 * Fill in a template with the hash of data.
 */
function generateTemplate (file, data) {
  debug(`Generating template from ${file}`)

  return fs.readFile(file)
    .then(template => {
      const result = _.template(template)(data)
      debug(`Generated template from ${file}\n${result}`)
      return result
    })
}

module.exports = {
  /**
   * Create a file from a template. Any necessary directories are automatically created.
   */
  createTemplatedFile: function createTemplatedFile (templatePath, dest, options, filePermissions) {
    const fileOptions = {}
    if (filePermissions) {
      fileOptions.mode = filePermissions
    }
    return fs.ensureDir(path.dirname(dest), '0755')
      .then(() => generateTemplate(templatePath, options))
      .then(data => fs.outputFile(dest, data, fileOptions))
  },
  generateTemplate
}
