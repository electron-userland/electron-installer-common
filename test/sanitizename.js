'use strict'

const sanitizeName = require('../src/sanitizename')
const test = require('ava')

test('replaces invalid characters', t => {
  t.is(sanitizeName('abcd', 'abd'), 'ab-d')
})

test('replaces invalid characters with custom replacement', t => {
  t.is(sanitizeName('abcd', 'abd', '@'), 'ab@d')
})
