'use strict'

const replaceScopeName = require('../src/replacescopename')
const test = require('ava')

test('Return empty string if none given', t => {
  t.is(replaceScopeName(), '')
})

test('Return same name if not scoped', t => {
  t.is(replaceScopeName('myapp'), 'myapp')
})

test('Scoped name with default divider', t => {
  t.is(replaceScopeName('@scoped/core'), 'scoped-core')
})

test('Scoped name using a custom divider', t => {
  t.is(replaceScopeName('@scoped/core', '_'), 'scoped_core')
})
