'use strict'

const error = require('../src/error')
const test = require('ava')

test('errorMessage with Error containing message', t => {
  t.is(error.errorMessage('in a test', new Error('Message')), 'Error in a test: Message')
})

test('errorMessage with Error sans message', t => {
  t.is(error.errorMessage('in a test', new Error()), 'Error in a test: Error')
})

test('wrapError', t => {
  const promise = Promise.reject(new Error('My error'))
    .catch(error.wrapError('in a test'))
  return t.throwsAsync(promise, /Error in a test: My error/)
})
