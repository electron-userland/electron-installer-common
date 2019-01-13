'use strict'

function errorMessage (message, err) {
  return `Error ${message}: ${err.message || err}`
}

module.exports = {
  errorMessage: errorMessage,
  /**
   * Prepends the error message with the given `message`.
   *
   * Designed to be used in a `Promise`'s `catch` method. For example:
   *
   * ```javascript
   * Promise.reject(new Error('My error')).catch(wrapError('with the code'))
   * ```
   */
  wrapError: function wrapError (message) {
    return err => {
      err.message = errorMessage(message, err)
      throw err
    }
  }
}
