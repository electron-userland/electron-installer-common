'use strict'

const fs = require('fs-extra')
const { hasSandboxHelper } = require('../src/sandboxhelper')
const path = require('path')
const test = require('ava')
const util = require('./_util')

test('hasSandboxHelper returns true when chrome-sandbox exists', t => {
  return util.unsafeTempDir(async dir => {
    await fs.writeFile(path.join(dir.path, 'chrome-sandbox'), '')
    t.true(await hasSandboxHelper(dir.path))
  })
})

test('hasSandboxhelper returns false when chrome-sandbox does not exist', t => {
  return util.unsafeTempDir(async dir => {
    t.false(await hasSandboxHelper(dir.path))
  })
})
