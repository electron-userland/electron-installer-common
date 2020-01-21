'use strict'

const spawn = require('cross-spawn')

/**
 * A wrapper around `cross-spawn`'s `spawn` function which can optionally log the command executed
 * and/or change the error message via a callback.
 *
 * If logger is specified in options, it's usually a debug or console.log function pointer.
 * Specify updateErrorCallback (a callback) in options to adjust the error object before it
 * is rethrown.
 */
module.exports = async function (cmd, args, options = {}) {
  const { logger, updateErrorCallback, ...spawnOptions } = options
  /* istanbul ignore if */
  if (logger) logger(`Executing command ${cmd} ${args.join(' ')}`)

  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const process = spawn(cmd, args, spawnOptions)
    process.stdout.on('data', data => {
      stdout += data.toString()
    })
    process.stderr.on('data', data => {
      /* istanbul ignore next */
      stderr += data.toString()
    })
    process.on('close', code => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(`Command failed with a non-zero return code (${code}):\n${cmd} ${args.join(' ')}\n${stdout}\n${stderr}`))
      }
    })
    process.on('error', err => {
      if (updateErrorCallback) {
        updateErrorCallback(err, !!logger)
      }
      reject(new Error(`Error executing command (${err.message || err}):\n${cmd} ${args.join(' ')}\n${stderr}`))
    })
  })
}
