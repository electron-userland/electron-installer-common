'use strict'

const spawn = require('../src/spawn')
const test = require('ava')

test('returns stdout', async t => {
  const dir = process.platform === 'darwin' ? 'ls' : 'dir'
  const output = await spawn(dir, [__dirname], log => null)
  t.regex(output, /spawn/)
})

test('throws an error when it cannot find an executable', t => {
  return t.throwsAsync(spawn('does-not-exist', []), { message: /^Error executing command/ })
})

test('updateErrorCallback modifies the exception', t => {
  return t.throwsAsync(spawn('does-not-exist', [], { updateErrorCallback: err => { err.message = 'I am an error' } }), { message: /I am an error/ })
})
