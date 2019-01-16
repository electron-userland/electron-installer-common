'use strict'

const { createDesktopFile } = require('../src/desktop')
const path = require('path')
const test = require('ava')
const util = require('./_util')

test('createDesktopFile', t => {
  return util.unsafeTempDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered.desktop')
    return createDesktopFile(util.SIMPLE_TEMPLATE_PATH, dir.path, 'rendered', { name: 'World' })
      .then(() => util.assertPathExists(t, renderedPath))
  })
})
