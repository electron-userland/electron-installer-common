import { expect, test } from 'vitest';
import { errorMessage, wrapError } from '../src/error.js';

test('errorMessage with Error containing message', () => {
  expect(errorMessage('in a test', new Error('Message'))).toBe('Error in a test: Message');
});

test('errorMessage with Error sans message', () => {
  expect(errorMessage('in a test', new Error())).toBe('Error in a test: Error');
});

test('wrapError', async () => {
  const promise = Promise.reject(new Error('My error')).catch(wrapError('in a test'));
  await expect(promise).rejects.toThrow(/Error in a test: My error/);
});

test('wrapError with wrappedFunction specified', () => {
  expect(() =>
    wrapError('in a test', () => {
      throw new Error('My error');
    }),
  ).toThrowError('Error in a test: My error');
});
