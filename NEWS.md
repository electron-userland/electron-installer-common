# `electron-installer-common` - Changes by Version

## [Unreleased]

[Unreleased]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.3...master

## [0.6.3] - 2019-05-02

[0.6.3]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.2...v0.6.3

### Added

* `updateSandboxHelperPermissions` function outside of `ElectronInstaller` (#23)

## [0.6.2] - 2019-03-07

[0.6.2]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.1...v0.6.2

### Added

* Sandbox helper permission updater (#16)

## [0.6.1] - 2019-02-19

[0.6.1]: https://github.com/electron-userland/electron-installer-common/compare/v0.6.0...v0.6.1

### Fixed

* Upgrade `asar` to `^1.0.0`, which removes a vulnerable transitive dependency (#15)

## [0.6.0] - 2019-01-22

[0.6.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.5.0...v0.6.0

### Fixed

* Retain original backtrace when using wrapError (#11)

### Changed

* Replace many exported functions with an installer class (#13)
* Rename `readMeta` to `readMetadata` (#14)

## [0.5.0] - 2019-01-04

[0.5.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.4.2...v0.5.0

### Added

* `sanitizeName` function (#10)

### Changed

* The default value for `replaceScopeName`'s `divider` parameter changed from `_` to `-` (#10)

## [0.4.2] - 2019-01-03

[0.4.2]: https://github.com/electron-userland/electron-installer-common/compare/v0.4.1...v0.4.2

### Added

* Re-export public functions not already in `src/index.js` (#7)

## [0.4.1] - 2019-01-02

[0.4.1]: https://github.com/electron-userland/electron-installer-common/compare/v0.4.0...v0.4.1

### Fixed

* Check that `createBinary` symlinks to an existing Electron app binary (#6)

## [0.4.0] - 2018-12-26

[0.4.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.3.0...v0.4.0

### Changed

* `getDepends` no longer uses `getTrashDepends` (#4)
* `getTrashDepends` returns a list of dependencies instead of a Debian-style dependency string (#4)

## [0.3.0] - 2018-12-26

[0.3.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.2.0...v0.3.0

### Changed

* Don't require an `options` object to use `readElectronVersion` (#3)

## [0.2.0] - 2018-12-26

[0.2.0]: https://github.com/electron-userland/electron-installer-common/compare/v0.1.0...v0.2.0

### Added

* scoped package name replacer (#1)
* utility functions for dealing with dependencies (#2)

## [0.1.0] - 2018-12-13

[0.1.0]: https://github.com/electron-userland/electron-installer-common/releases/tag/v0.1.0

Initial release.
