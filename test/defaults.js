'use strict'

const getDefaultsFromPackageJSON = require('../src/defaults')
const test = require('ava')

test('empty package.json', t => {
  t.deepEqual(getDefaultsFromPackageJSON({}), {
    arch: undefined,
    bin: 'electron',
    execArguments: [],
    categories: [
      'GNOME',
      'GTK',
      'Utility'
    ],
    description: undefined,
    genericName: undefined,
    homepage: '',
    mimeType: [],
    name: 'electron',
    productDescription: undefined,
    productName: undefined,
    revision: '1'
  })
})

test('name, product name specified', t => {
  const defaults = getDefaultsFromPackageJSON({
    name: 'myapp',
    productName: 'My App'
  })
  t.is(defaults.bin, 'myapp')
  t.is(defaults.genericName, 'My App')
  t.is(defaults.name, 'myapp')
  t.is(defaults.productName, 'My App')
})

test('generic name specified', t => {
  const defaults = getDefaultsFromPackageJSON({ genericName: 'Generic Name' })
  t.is(defaults.genericName, 'Generic Name')
})

test('description and product description specified', t => {
  const defaults = getDefaultsFromPackageJSON({ description: 'Description', productDescription: 'Product' })
  t.is(defaults.description, 'Description')
  t.is(defaults.productDescription, 'Product')
})

test('revision specified', t => {
  const defaults = getDefaultsFromPackageJSON({ revision: '7' })
  t.is(defaults.revision, '7')
})
