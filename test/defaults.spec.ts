import { expect, test } from 'vitest';
import { getDefaultsFromPackageJSON } from '../src/defaults.js';

test('empty package.json', () => {
  expect(getDefaultsFromPackageJSON({})).toEqual({
    arch: undefined,
    bin: 'electron',
    execArguments: [],
    categories: ['GNOME', 'GTK', 'Utility'],
    description: undefined,
    genericName: undefined,
    homepage: '',
    mimeType: [],
    name: 'electron',
    productDescription: undefined,
    productName: undefined,
    revision: undefined,
  });
});

test('name, product name specified', () => {
  const defaults = getDefaultsFromPackageJSON({
    name: 'myapp',
    productName: 'My App',
  });
  expect(defaults.bin).toBe('myapp');
  expect(defaults.genericName).toBe('My App');
  expect(defaults.name).toBe('myapp');
  expect(defaults.productName).toBe('My App');
});

test('generic name specified', () => {
  const defaults = getDefaultsFromPackageJSON({ genericName: 'Generic Name' });
  expect(defaults.genericName).toBe('Generic Name');
});

test('description and product description specified', () => {
  const defaults = getDefaultsFromPackageJSON({
    description: 'Description',
    productDescription: 'Product',
  });
  expect(defaults.description).toBe('Description');
  expect(defaults.productDescription).toBe('Product');
});

test('revision not specified with a fallback specified', () => {
  const { revision } = getDefaultsFromPackageJSON({}, { revision: '1' });
  expect(revision).toBe('1');
});

test('revision specified', () => {
  const defaults = getDefaultsFromPackageJSON({ revision: '7' });
  expect(defaults.revision).toBe('7');
});
