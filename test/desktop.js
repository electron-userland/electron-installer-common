'use strict'

const { createDesktopFile } = require('../src/desktop')
const fs = require('fs-extra')
const path = require('path')
const test = require('ava')
const tmp = require('tmp-promise')

const SIMPLE_TEMPLATE_PATH = path.resolve(__dirname, 'fixtures', 'template', 'simple.ejs')

test('createDesktopFile', t => {
  return tmp.withDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered.desktop')
    return createDesktopFile(SIMPLE_TEMPLATE_PATH, dir.path, 'rendered', { name: 'World' })
      .then(() => fs.pathExists(renderedPath))
      .then(exists => t.true(exists))
  }, { unsafeCleanup: true })
})
