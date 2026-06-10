import semver from 'semver';
import type { DependencyMap } from './types.js';

function union(...arrays: (string[] | undefined)[]): string[] {
  return [...new Set(arrays.flatMap((array) => array ?? []))];
}

/**
 * Determine whether libatspi2 is necessary, given the Electron version.
 */
export function getATSPIDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.gte(version, '5.0.0-beta.1') ? [dependencyMap.atspi] : [];
}

/**
 * Determine whether DRM is a necessary dependency, given the Electron version.
 */
export function getDRMDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.gte(version, '9.0.0-beta.1') ? [dependencyMap.drm] : [];
}

/**
 * Determine whether GBM is a necessary dependency, given the Electron version.
 */
export function getGBMDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.gte(version, '9.0.0-beta.1') ? [dependencyMap.gbm] : [];
}

/**
 * Determine whether GConf is a necessary dependency, given the Electron version.
 */
export function getGConfDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.lt(version, '3.0.0-beta.1') ? [dependencyMap.gconf] : [];
}

/**
 * Determine the GTK dependency based on the Electron version in use.
 */
export function getGTKDepends(version: string, dependencyMap: DependencyMap): string {
  return semver.gte(version, '2.0.0-beta.1') ? dependencyMap.gtk3 : dependencyMap.gtk2;
}

/**
 * Determine the dependencies for the `shell.moveItemToTrash` Electron API, based on the
 * Electron version in use.
 *
 * @returns an ordered list of dependencies that are OR'd together by the installer module.
 */
export function getTrashDepends(version: string, dependencyMap: DependencyMap): string[] {
  if (semver.lt(version, '1.4.1')) {
    return [dependencyMap.gvfs];
  } else if (semver.lt(version, '1.7.2')) {
    return [
      dependencyMap.kdeCliTools,
      dependencyMap.kdeRuntime,
      dependencyMap.trashCli,
      dependencyMap.gvfs,
    ].flat();
  } else {
    return [
      dependencyMap.kdeCliTools,
      dependencyMap.kdeRuntime,
      dependencyMap.trashCli,
      dependencyMap.glib2,
      dependencyMap.gvfs,
    ].flat();
  }
}

/**
 * Determine whether libuuid is necessary, given the Electron version.
 */
export function getUUIDDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.satisfies(version, '>=4.0.0-beta.1 <8.0.0-beta.1') ? [dependencyMap.uuid] : [];
}

/**
 * Determine whether dri3 extension for X C Binding is a necessary dependency, given the Electron version.
 */
export function getXcbDri3Depends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.gte(version, '9.0.0-beta.1') ? [dependencyMap.xcbDri3] : [];
}

/**
 * Determine whether libXss is a necessary dependency, given the Electron version.
 */
export function getXssDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.lt(version, '10.0.0-beta.1') ? [dependencyMap.xss] : [];
}

/**
 * Determine whether libxtst6 is a necessary dependency, given the Electron version.
 */
export function getXtstDepends(version: string, dependencyMap: DependencyMap): string[] {
  return semver.lt(version, '11.0.0-beta.1') ? [dependencyMap.xtst] : [];
}

/**
 * Determine the default dependencies for an Electron application.
 */
export function getDepends(version: string, dependencyMap: DependencyMap): string[] {
  return [
    getGTKDepends(version, dependencyMap),
    dependencyMap.notify,
    dependencyMap.nss,
    dependencyMap.xdgUtils,
  ]
    .concat(getATSPIDepends(version, dependencyMap))
    .concat(getDRMDepends(version, dependencyMap))
    .concat(getGBMDepends(version, dependencyMap))
    .concat(getGConfDepends(version, dependencyMap))
    .concat(getUUIDDepends(version, dependencyMap))
    .concat(getXcbDri3Depends(version, dependencyMap))
    .concat(getXssDepends(version, dependencyMap))
    .concat(getXtstDepends(version, dependencyMap));
}

/**
 * Merge the user specified dependencies (from either the API or the CLI) with the respective
 * default dependencies, given the `dependencyKey`.
 *
 * @param data - the user-specified data
 * @param dependencyKey - the dependency type (e.g., `depends` for Debian runtime dependencies)
 * @param defaults - the default options for the installer module
 */
export function mergeUserSpecified(
  data: Record<string, unknown>,
  dependencyKey: string,
  defaults: Record<string, unknown>,
): string[] {
  const userSpecified = (data.options ?? data) as Record<string, unknown>;
  return union(
    defaults[dependencyKey] as string[] | undefined,
    userSpecified[dependencyKey] as string[] | undefined,
  );
}
