'use strict'

const readMetadata = require('../src/readmetadata')
const path = require('path')
const test = require('ava')

test('readMetadata for app with asar', async t => {
  const packageJSON = await readMetadata({ src: path.join(__dirname, 'fixtures', 'app-with-asar'), logger: log => log })
  t.regex(packageJSON.description, /with asar/)
})

test('readMetadata for app without asar', async t => {
  const packageJSON = await readMetadata({ src: path.join(__dirname, 'fixtures', 'app-without-asar'), logger: log => log })
  t.regex(packageJSON.description, /without asar/)
})

test('readMetadata for invalid app', t => {
  return t.throwsAsync(readMetadata({ src: path.join(__dirname, 'fixtures'), logger: log => log }), { message: /Could not find, read, or parse/ })
})
