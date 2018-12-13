'use strict'

const getHomePage = require('../src/gethomepage')
const test = require('ava')

const scenarios = [
  {
    name: 'Return empty string if none available',
    pkg: {},
    expectedURL: ''
  },
  {
    name: 'Use homepage property if present',
    pkg: {
      homepage: 'http://example.com/homepage-property',
      author: 'First Last <first.last@example.com> (http://www.example.com/author-string)'
    },
    expectedURL: 'http://example.com/homepage-property'
  },
  {
    name: 'Use URL from author string if no homepage',
    pkg: {
      author: 'First Last <first.last@example.com> (http://www.example.com/author-string)'
    },
    expectedURL: 'http://www.example.com/author-string'
  },
  {
    name: 'Use URL from author object if no homepage',
    pkg: {
      author: {
        url: 'http://www.example.com/author-object-url'
      }
    },
    expectedURL: 'http://www.example.com/author-object-url'
  },
  {
    name: 'undefined if neither author string has no URL nor homepage is specified',
    pkg: {
      author: 'Alice B.'
    },
    expectedURL: undefined
  },
  {
    name: 'blank if author name is present but neither homepage nor author URL is specified',
    pkg: {
      author: { name: 'Alice B.' }
    },
    expectedURL: ''
  }
]

for (const scenario of scenarios) {
  test(scenario.name, t => t.is(getHomePage(scenario.pkg), scenario.expectedURL))
}
