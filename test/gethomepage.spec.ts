import { expect, test } from 'vitest';
import { getHomePage } from '../src/gethomepage.js';

test('Return empty string if none available', () => {
  expect(getHomePage({})).toBe('');
});

test('Use homepage property if present', () => {
  expect(
    getHomePage({
      homepage: 'http://example.com/homepage-property',
      author: 'First Last <first.last@example.com> (http://www.example.com/author-string)',
    }),
  ).toBe('http://example.com/homepage-property');
});

test('Use URL from author string if no homepage', () => {
  expect(
    getHomePage({
      author: 'First Last <first.last@example.com> (http://www.example.com/author-string)',
    }),
  ).toBe('http://www.example.com/author-string');
});

test('Use URL from author object if no homepage', () => {
  expect(getHomePage({ author: { url: 'http://www.example.com/author-object-url' } })).toBe(
    'http://www.example.com/author-object-url',
  );
});

test('undefined if neither author string has no URL nor homepage is specified', () => {
  expect(getHomePage({ author: 'Alice B.' })).toBe(undefined);
});

test('blank if author name is present but neither homepage nor author URL is specified', () => {
  expect(getHomePage({ author: { name: 'Alice B.' } })).toBe('');
});
