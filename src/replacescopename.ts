/**
 * Normalizes a scoped package name for use as an OS package name.
 *
 * @param name - the Node package name to normalize
 * @param divider - the character(s) to replace slashes with
 */
export function replaceScopeName(name?: string | null, divider?: string | null): string {
  return (name || '').replace(/^@/, '').replace('/', divider || '-');
}
