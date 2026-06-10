import type { CatchableFunction } from './types.js';

export function errorMessage(message: string, err: Error | string): string {
  return `Error ${message}: ${(err as Error).message || err}`;
}

/**
 * Prepends the error message with the given `message`.
 *
 * Designed to be used in a `Promise`'s `catch` method. For example:
 *
 * ```javascript
 * Promise.reject(new Error('My error')).catch(wrapError('with the code'))
 * ```
 *
 * The `wrappedFunction` parameter is used for async/await use cases. For example:
 *
 * ```javascript
 * wrapError('with the code', async () => {
 *   await foo();
 *   await bar();
 * })
 * ```
 */
export function wrapError(message: string): CatchableFunction;
export function wrapError<T>(message: string, wrappedFunction: () => T): T;
export function wrapError<T>(message: string, wrappedFunction?: () => T): T | CatchableFunction {
  if (wrappedFunction) {
    try {
      return wrappedFunction();
    } catch (error) {
      wrapError(message)(error as Error);
      /* istanbul ignore next: wrapError always throws */
      throw error;
    }
  }

  return (err: Error) => {
    err.message = errorMessage(message, err);
    throw err;
  };
}
