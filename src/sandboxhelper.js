'use strict'

const fs = require('fs-extra')
const path = require('path')

/**
 * For Electron versions that support the setuid sandbox on Linux, changes the permissions of
 * the `chrome-sandbox` executable as appropriate.
 *
 * The sandbox helper executable must have the setuid (`+s` / `0o4000`) bit set.
 *
 * This doesn't work on Windows because you can't set that bit there.
 *
 * See: https://github.com/electron/electron/pull/17269#issuecomment-470671914
 */
module.exports = function updateSandboxHelperPermissions (appDir) {
  const sandboxHelperPath = path.join(appDir, 'chrome-sandbox')
  return fs.pathExists(sandboxHelperPath)
    .then(exists => {
      if (exists) {
        return fs.chmod(sandboxHelperPath, 0o4755)
      } else {
        return Promise.resolve()
      }
    })
}
