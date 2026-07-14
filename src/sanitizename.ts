import { replaceScopeName } from './replacescopename.js';

/**
 * Sanitizes a package name for use as an installer name.
 *
 * Includes running `replaceScopeName`.
 *
 * @param name - the Node package name to normalize
 * @param allowedCharacterRange - a `RegExp` range (minus the square brackets) of allowable
 * characters for the given installer
 * @param replacement - the character(s) to replace invalid characters with
 */
export function sanitizeName(
  name: string,
  allowedCharacterRange: string,
  replacement?: string | null,
): string {
  const replaceWith = replacement || '-';

  return replaceScopeName(name, replaceWith).replace(
    new RegExp(`[^${allowedCharacterRange}]`, 'g'),
    replaceWith,
  );
}
