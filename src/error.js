'use strict'

function errorMessage (message, err) {
  return `Error ${message}: ${err.message || err}`
}

module.exports = {
  errorMessage: errorMessage,
  wrapError: function wrapError (message) {
    return err => {
      /* istanbul ignore next */
      throw new Error(errorMessage(message, err))
    }
  }
}
