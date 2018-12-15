'use strict'

const getHomePage = require('../src/gethomepage')
const test = require('ava')

test(
  'Return empty string if none available',
  t => t.is(getHomePage({}), '')
)

test(
  'Use homepage property if present',
  t => t.is(getHomePage({
    homepage: 'http://example.com/homepage-property',
    author: 'First Last <first.last@example.com> (http://www.example.com/author-string)'
  }), 'http://example.com/homepage-property')
)

test(
  'Use URL from author string if no homepage',
  t => t.is(
    getHomePage({ author: 'First Last <first.last@example.com> (http://www.example.com/author-string)' }),
    'http://www.example.com/author-string'
  )
)

test(
  'Use URL from author object if no homepage',
  t => t.is(
    getHomePage({ author: { url: 'http://www.example.com/author-object-url' } }),
    'http://www.example.com/author-object-url'
  )
)

test(
  'undefined if neither author string has no URL nor homepage is specified',
  t => t.is(getHomePage({ author: 'Alice B.' }), undefined)
)

test(
  'blank if author name is present but neither homepage nor author URL is specified',
  t => t.is(getHomePage({ author: { name: 'Alice B.' } }), '')
)
