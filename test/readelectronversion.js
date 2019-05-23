'use strict'

const path = require('path')
const readElectronVersion = require('../src/readelectronversion')
const test = require('ava')

test('readElectronVersion', async t => {
  const version = await readElectronVersion(path.resolve(__dirname, 'fixtures'))
  t.is(version, 'v3.0.11')
})
