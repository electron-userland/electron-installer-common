'use strict'

const path = require('path')
const template = require('../src/template')
const test = require('ava')
const util = require('./_util')

test('generateTemplate', async t => {
  const data = await template.generateTemplate(util.SIMPLE_TEMPLATE_PATH, { name: 'World' })
  t.is(data.trim(), 'Hello, World!')
})

test('createTemplatedFile', t => {
  return util.unsafeTempDir(async dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    await template.createTemplatedFile(util.SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' })
    await util.assertTrimmedFileContents(t, renderedPath, 'Hello, World!')
  })
})

test('createTemplatedFile with permissions', t => {
  return util.unsafeTempDir(async dir => {
    const renderedPath = path.join(dir.path, 'rendered')
    await template.createTemplatedFile(util.SIMPLE_TEMPLATE_PATH, renderedPath, { name: 'World' }, 0o644)
    await util.assertTrimmedFileContents(t, renderedPath, 'Hello, World!')
    await util.assertPathPermissions(t, renderedPath, 0o644)
  })
})
