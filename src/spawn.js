'use strict'

const spawn = require('cross-spawn')

/**
 * Spawn a child process and make the error message more human friendly, if possible.
 *
 * If logger is specified, it's usually a debug or console.log function pointer.
 * Specify updateErrorCallback (a callback) to adjust the error object before it is rethrown.
 */
module.exports = async function (cmd, args, logger, updateErrorCallback) {
  if (logger) logger(`Executing command ${cmd} ${args.join(' ')}`)

  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const process = spawn(cmd, args)
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
