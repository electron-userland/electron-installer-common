'use strict'

/**
 * Returns a string containing only characters that are allowed as a package name
 */
module.exports = function (name, divider) {
  name = name || ''
  divider = divider || '_'
  return name.replace(/^@/, '').replace(/\//, divider)
}
