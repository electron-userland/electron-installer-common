import type { PackageJSON } from './types.js';

// Equivalent to the author-regex/parse-author packages, which this module used to depend on.
const AUTHOR_PATTERN = /^([^<(]+?)?[ \t]*(?:<([^>(]+?)>)?[ \t]*(?:\(([^)]+?)\)|$)/;

/**
 * Determine the homepage based on the settings in `package.json`.
 */
export function getHomePage(pkg: PackageJSON): string | undefined {
  if (pkg.homepage) {
    return pkg.homepage;
  } else if (pkg.author) {
    if (typeof pkg.author === 'string') {
      return AUTHOR_PATTERN.exec(pkg.author)?.[3];
    } else if (pkg.author.url) {
      return pkg.author.url;
    }
  }

  return '';
}
