export { getDefaultsFromPackageJSON } from './defaults.js';
export {
  getATSPIDepends,
  getDepends,
  getDRMDepends,
  getGBMDepends,
  getGConfDepends,
  getGTKDepends,
  getTrashDepends,
  getUUIDDepends,
  getXcbDri3Depends,
  getXssDepends,
  getXtstDepends,
  mergeUserSpecified,
} from './dependencies.js';
export { createDesktopFile } from './desktop.js';
export { errorMessage, wrapError } from './error.js';
export { getHomePage } from './gethomepage.js';
export { ElectronInstaller, type CopyFilter, type InstallerOptions } from './installer.js';
export { readElectronVersion } from './readelectronversion.js';
export { readMetadata } from './readmetadata.js';
export { replaceScopeName } from './replacescopename.js';
export { hasSandboxHelper, updateSandboxHelperPermissions } from './sandboxhelper.js';
export { sanitizeName } from './sanitizename.js';
export { ExitCodeError, spawn, type CrossSpawnOptions } from './spawn.js';
export { createTemplatedFile, generateTemplate } from './template.js';
export type {
  CatchableFunction,
  Configuration,
  DependencyMap,
  DependencyType,
  PackageJSON,
  ReadMetadataOptions,
  UserSuppliedOptions,
} from './types.js';
