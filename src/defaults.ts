import { getHomePage } from './gethomepage.js';
import type { Configuration, PackageJSON } from './types.js';

/**
 * Generate default configuration values from the given parsed `package.json`.
 *
 * @param pkg - the parsed `package.json` file
 * @param fallbacks - fallback default value for certain options, currently:
 * * `revision`
 */
export function getDefaultsFromPackageJSON(
  pkg: PackageJSON,
  fallbacks: Pick<Configuration, 'revision'> = {},
): Configuration {
  return {
    arch: undefined,
    bin: pkg.name || 'electron',
    execArguments: [],
    categories: ['GNOME', 'GTK', 'Utility'],
    description: pkg.description,
    genericName: pkg.genericName || pkg.productName || pkg.name,
    homepage: getHomePage(pkg),
    mimeType: [],
    name: pkg.name || 'electron',
    productDescription: pkg.productDescription || pkg.description,
    productName: pkg.productName || pkg.name,
    revision: pkg.revision || fallbacks.revision,
  };
}
