'use strict'

const spawn = require('../src/spawn')
const test = require('ava')

test('returns stdout', t => {
  const dir = process.platform === 'darwin' ? 'ls' : 'dir'
  return spawn(dir, [__dirname], log => null)
    .then(output => t.regex(output, /spawn/))
})

test('throws an error when it cannot find an executable', t => {
  return t.throwsAsync(spawn('does-not-exist', []), /^Error executing command/)
})

test('updateErrorCallback modifies the exception', t => {
  return t.throwsAsync(spawn('does-not-exist', [], null, err => { err.message = 'I am an error' }), /I am an error/)
})
