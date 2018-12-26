'use strict'

const path = require('path')
const readElectronVersion = require('../src/readelectronversion')
const test = require('ava')

test('readElectronVersion', t => {
  return readElectronVersion(path.resolve(__dirname, 'fixtures'))
    .then(version => t.is(version, 'v3.0.11'))
})
