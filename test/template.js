'use strict'

const fs = require('fs-extra')
const path = require('path')
const template = require('../src/template')
const test = require('ava')
const util = require('./_util')

test('generateTemplate', t => {
  return template.generateTemplate(util.SIMPLE_TEMPLATE_PATH, { name: 'World' })
    .then(data => t.is(data.trim(), 'Hello, World!'))
})

test('createTemplatedFile', t => {
  return util.unsafeTempDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    return template.createTemplatedFile(util.SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' })
      .then(() => util.assertTrimmedFileContents(t, renderedPath, 'Hello, World!'))
  })
})

test('createTemplatedFile with permissions', t => {
  return util.unsafeTempDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    return template.createTemplatedFile(util.SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' }, 0o744)
      .then(() => util.assertTrimmedFileContents(t, renderedPath, 'Hello, World!'))
      .then(() => fs.access(renderedPath, fs.constants.X_OK))
  })
})
