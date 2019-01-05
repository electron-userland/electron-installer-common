# `electron-installer-common` - Changes by Version

## [Unreleased]

[Unreleased]: https://github.com/electron-userland/electron-installer-common/compare/v0.5.0...master

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
