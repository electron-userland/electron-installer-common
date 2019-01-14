'use strict'

const fs = require('fs-extra')
const path = require('path')
const template = require('../src/template')
const test = require('ava')
const tmp = require('tmp-promise')

const SIMPLE_TEMPLATE_PATH = path.resolve(__dirname, 'fixtures', 'template', 'simple.ejs')

test('generateTemplate', t => {
  return template.generateTemplate(SIMPLE_TEMPLATE_PATH, { name: 'World' })
    .then(data => t.is(data, 'Hello, World!\n'))
})

test('createTemplatedFile', t => {
  return tmp.withDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    return template.createTemplatedFile(SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' })
      .then(() => fs.readFile(renderedPath))
      .then(data => t.is(data.toString(), 'Hello, World!\n'))
  }, { unsafeCleanup: true })
})

test('createTemplatedFile with permissions', t => {
  return tmp.withDir(dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    return template.createTemplatedFile(SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' }, 0o744)
      .then(() => fs.readFile(renderedPath))
      .then(data => t.is(data.toString(), 'Hello, World!\n'))
      .then(() => fs.access(renderedPath, fs.constants.X_OK))
  }, { unsafeCleanup: true })
})
