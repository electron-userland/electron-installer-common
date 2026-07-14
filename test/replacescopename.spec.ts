import { expect, test } from 'vitest';
import { replaceScopeName } from '../src/replacescopename.js';

test('Return empty string if none given', () => {
  expect(replaceScopeName()).toBe('');
});

test('Return same name if not scoped', () => {
  expect(replaceScopeName('myapp')).toBe('myapp');
});

test('Scoped name with default divider', () => {
  expect(replaceScopeName('@scoped/core')).toBe('scoped-core');
});

test('Scoped name using a custom divider', () => {
  expect(replaceScopeName('@scoped/core', '_')).toBe('scoped_core');
});
