'use strict'

const replaceScopeName = require('../src/replaceScopeName')
const test = require('ava')

test('Return empty string if none available', t => {
  t.is(replaceScopeName(), '')
})

test('Return same name if not scoped', t => {
  t.is(replaceScopeName('poopie'), 'poopie')
})

test('Scoped name with default divider', t => {
  t.is(replaceScopeName('@poopie/core'), 'poopie_core')
})

test('Scoped name using a custom divider', t => {
  t.is(replaceScopeName('@poopie/core', '-'), 'poopie-core')
})
