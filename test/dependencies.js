'use strict'

const _ = require('lodash')
const dependencies = require('../src/dependencies')
const test = require('ava')

const dependencyMap = {
  notify: 'libnotify4',
  nss: 'libnss3',
  xss: 'libxss1',
  xtst: 'libxtst6',
  xdgUtils: 'xdg-utils',
  gtk3: 'libgtk-3-0',
  gtk2: 'libgtk2.0-0',
  gconf: 'libgconf2-4',
  uuid: 'libuuid1',
  gvfs: 'gvfs-bin',
  kdeCliTools: 'kde-cli-tools',
  kdeRuntime: 'kde-runtime',
  trashCli: 'trash-cli',
  glib2: 'libglib2.0-bin'
}

test('getDepends returns the expected dependency', t => {
  t.true(dependencies.getDepends('4.0.0', dependencyMap).includes(dependencyMap.notify))
})

test('getGConfDepends: returns gconf pre-3.0', t => {
  t.is(dependencies.getGConfDepends('v2.0.0', dependencyMap)[0], dependencyMap.gconf)
})

test('getGConfDepends: returns nothing as of 3.0', t => {
  t.is(dependencies.getGConfDepends('4.0.0', dependencyMap).length, 0)
})

test('getGTKDepends: returns GTK2 pre-2.0', t => {
  t.is(dependencies.getGTKDepends('v1.8.2', dependencyMap), dependencyMap.gtk2)
})

test('getGTKDepends: returns GTK3 as of 2.0', t => {
  t.is(dependencies.getGTKDepends('v2.0.0', dependencyMap), dependencyMap.gtk3)
})

test('getTrashDepends: only depends on gvfs-bin before 1.4.1', t => {
  const trashDepends = dependencies.getTrashDepends('v1.3.0', dependencyMap)
  t.true(trashDepends.includes(dependencyMap.gvfs))
  t.false(trashDepends.includes(dependencyMap.kdeCliTools))
  t.false(trashDepends.includes(dependencyMap.glib2))
})

test('getTrashDepends: depends on KDE tools between 1.4.1 and 1.7.1', t => {
  const trashDepends = dependencies.getTrashDepends('v1.6.0', dependencyMap)
  t.true(trashDepends.includes(dependencyMap.gvfs))
  t.true(trashDepends.includes(dependencyMap.kdeCliTools))
  t.false(trashDepends.includes(dependencyMap.glib2))
})

test('getTrashDepends: depends on glib starting with 1.7.2', t => {
  const trashDepends = dependencies.getTrashDepends('v1.8.2', dependencyMap)
  t.true(trashDepends.includes(dependencyMap.gvfs))
  t.true(trashDepends.includes(dependencyMap.kdeCliTools))
  t.true(trashDepends.includes(dependencyMap.glib2))
})

test('getUUIDDepends: returns nothing pre-4.0', t => {
  t.is(dependencies.getUUIDDepends('v3.0.0', dependencyMap).length, 0)
})

test('getUUIDDepends: returns uuid as of 4.0', t => {
  t.is(dependencies.getUUIDDepends('4.0.0', dependencyMap)[0], dependencyMap.uuid)
})

function testMergeUserSpecified (t, dataPath) {
  const defaults = {
    dependencies: ['lsb', 'libXScrnSaver']
  }
  const data = _.set({}, dataPath, ['dbus', 'dbus', 'lsb'])

  const actual = dependencies.mergeUserSpecified(data, 'dependencies', defaults)
  actual.sort()
  t.deepEqual(actual, ['dbus', 'libXScrnSaver', 'lsb'])
}

test('mergeUserSpecified with API options', t => {
  testMergeUserSpecified(t, 'options.dependencies')
})

test('mergeUserSpecified with CLI options', t => {
  testMergeUserSpecified(t, 'dependencies')
})
