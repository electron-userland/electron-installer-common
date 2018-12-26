'use strict'

const readElectronVersion = require('../src/readelectronversion')
const test = require('ava')

test('readElectronVersion', t => {
  return readElectronVersion({ src: 'test/fixtures' })
    .then(version => t.is(version, 'v3.0.11'))
})
