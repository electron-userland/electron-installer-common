'use strict'

const spawn = require('cross-spawn-promise')

/**
 * Spawn a child process and make the error message more human friendly, if possible.
 *
 * Specify updateErrorCallback (a callback) to adjust the error object before it is rethrown.
 */
module.exports = function (cmd, args, logger, updateErrorCallback) {
  if (logger) logger(`Executing command ${cmd} ${args.join(' ')}`)

  return spawn(cmd, args)
    .then(stdout => stdout.toString())
    .catch(err => {
      const stderr = err.stderr ? err.stderr.toString() : ''
      if (updateErrorCallback) {
        updateErrorCallback(err, !!logger)
      }

      throw new Error(`Error executing command (${err.message || err}):\n${cmd} ${args.join(' ')}\n${stderr}`)
    })
}
