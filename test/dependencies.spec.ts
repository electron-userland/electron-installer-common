import { expect, test } from 'vitest';
import {
  getATSPIDepends,
  getDepends,
  getDRMDepends,
  getGBMDepends,
  getGConfDepends,
  getGTKDepends,
  getTrashDepends,
  getUUIDDepends,
  getXcbDri3Depends,
  getXssDepends,
  getXtstDepends,
  mergeUserSpecified,
} from '../src/dependencies.js';
import type { DependencyMap } from '../src/types.js';

const kdeCliTools = ['kde-cli-tools', 'kde-cli-tools5'];

const dependencyMap = {
  atspi: 'libatspi2.0-0',
  drm: 'libdrm',
  gbm: 'mesa-libgbm',
  xcbDri3: 'libxcb-dri3-0',
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
  kdeCliTools,
  kdeRuntime: 'kde-runtime',
  trashCli: 'trash-cli',
  glib2: 'libglib2.0-bin',
} as unknown as DependencyMap;

test('getATSPIDepends: returns atspi as of 5.0', () => {
  expect(getATSPIDepends('5.0.0', dependencyMap)[0]).toBe(dependencyMap.atspi);
});

test('getDRMDepends: returns drm as of 9.0', () => {
  expect(getDRMDepends('9.0.0', dependencyMap)[0]).toBe(dependencyMap.drm);
});

test('getGBMDepends: returns gbm as of 9.0', () => {
  expect(getGBMDepends('9.0.0', dependencyMap)[0]).toBe(dependencyMap.gbm);
});

test('getDepends returns the expected dependency', () => {
  expect(getDepends('4.0.0', dependencyMap).includes(dependencyMap.notify)).toBe(true);
});

test('getGConfDepends: returns gconf pre-3.0', () => {
  expect(getGConfDepends('v2.0.0', dependencyMap)[0]).toBe(dependencyMap.gconf);
});

test('getGConfDepends: returns nothing as of 3.0', () => {
  expect(getGConfDepends('4.0.0', dependencyMap).length).toBe(0);
});

test('getGTKDepends: returns GTK2 pre-2.0', () => {
  expect(getGTKDepends('v1.8.2', dependencyMap)).toBe(dependencyMap.gtk2);
});

test('getGTKDepends: returns GTK3 as of 2.0', () => {
  expect(getGTKDepends('v2.0.0', dependencyMap)).toBe(dependencyMap.gtk3);
});

test('getTrashDepends: only depends on gvfs-bin before 1.4.1', () => {
  const trashDepends = getTrashDepends('v1.3.0', dependencyMap);
  expect(trashDepends.includes(dependencyMap.gvfs)).toBe(true);
  for (const packageName of kdeCliTools) {
    expect(trashDepends.includes(packageName)).toBe(false);
  }
  expect(trashDepends.includes(dependencyMap.glib2)).toBe(false);
});

test('getTrashDepends: depends on KDE tools between 1.4.1 and 1.7.1', () => {
  const trashDepends = getTrashDepends('v1.6.0', dependencyMap);
  expect(trashDepends.includes(dependencyMap.gvfs)).toBe(true);
  for (const packageName of kdeCliTools) {
    expect(trashDepends.includes(packageName)).toBe(true);
  }
  expect(trashDepends.includes(dependencyMap.glib2)).toBe(false);
});

test('getTrashDepends: depends on glib starting with 1.7.2', () => {
  const trashDepends = getTrashDepends('v1.8.2', dependencyMap);
  expect(trashDepends.includes(dependencyMap.gvfs)).toBe(true);
  for (const packageName of kdeCliTools) {
    expect(trashDepends.includes(packageName)).toBe(true);
  }
  expect(trashDepends.includes(dependencyMap.glib2)).toBe(true);
});

test('getUUIDDepends: returns nothing pre-4.0', () => {
  expect(getUUIDDepends('v3.0.0', dependencyMap).length).toBe(0);
});

test('getUUIDDepends: returns uuid as of 4.0', () => {
  expect(getUUIDDepends('4.0.0', dependencyMap)[0]).toBe(dependencyMap.uuid);
});

test('getUUIDDepends: returns nothing as of 8.0.0-beta.1', () => {
  expect(getUUIDDepends('8.0.0', dependencyMap).length).toBe(0);
});

test('getXcbDri3Depends: returns gbm as of 9.0', () => {
  expect(getXcbDri3Depends('9.0.0', dependencyMap)[0]).toBe(dependencyMap.xcbDri3);
});

test('getXssDepends: retuns xss pre-10.0', () => {
  expect(getXssDepends('9.0.0', dependencyMap)[0]).toBe(dependencyMap.xss);
});

test('getXssDepends: retuns nothing as of 10.0', () => {
  expect(getXssDepends('10.0.0', dependencyMap).length).toBe(0);
});

test('getXtstDepends: retuns xtst pre-11.0', () => {
  expect(getXtstDepends('10.0.0', dependencyMap)[0]).toBe(dependencyMap.xtst);
});

test('getXtstDepends: retuns nothing as of 11.0.0-beta.1', () => {
  expect(getXtstDepends('11.0.0', dependencyMap).length).toBe(0);
});

function testMergeUserSpecified(data: Record<string, unknown>) {
  const defaults = {
    dependencies: ['lsb', 'libXScrnSaver'],
  };

  const actual = mergeUserSpecified(data, 'dependencies', defaults);
  actual.sort();
  expect(actual).toEqual(['dbus', 'libXScrnSaver', 'lsb']);
}

test('mergeUserSpecified with API options', () => {
  testMergeUserSpecified({ options: { dependencies: ['dbus', 'dbus', 'lsb'] } });
});

test('mergeUserSpecified with CLI options', () => {
  testMergeUserSpecified({ dependencies: ['dbus', 'dbus', 'lsb'] });
});
