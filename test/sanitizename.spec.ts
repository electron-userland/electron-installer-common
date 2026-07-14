import { expect, test } from 'vitest';
import { sanitizeName } from '../src/sanitizename.js';

test('replaces invalid characters', () => {
  expect(sanitizeName('abcd', 'abd')).toBe('ab-d');
});

test('replaces invalid characters with custom replacement', () => {
  expect(sanitizeName('abcd', 'abd', '@')).toBe('ab@d');
});
