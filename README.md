# `electron-installer-common`

[![Build Status](https://github.com/electron-userland/electron-installer-common/workflows/CI/badge.svg)](https://github.com/electron-userland/electron-installer-common/actions?query=workflow:CI)

`electron-installer-common` provides common functionality for creating distributable Electron
apps. It is the shared core of installer modules such as
[`electron-installer-debian`](https://github.com/electron-userland/electron-installer-debian),
[`electron-installer-redhat`](https://github.com/electron-userland/electron-installer-redhat), and
[`electron-installer-snap`](https://github.com/electron-userland/electron-installer-snap) — if you
are packaging an app, you likely want one of those instead of this package directly.

## What it provides

* **`ElectronInstaller`**: a base class implementing the shared packaging pipeline (staging
  directory, app files, binary symlink, icons, copyright, `.desktop` entry, sandbox permissions),
  which installer modules subclass with their format-specific pieces.
* **App metadata**: reading `package.json` and the Electron version out of a packaged app, and
  deriving default installer options from them.
* **Linux dependency calculation**: computing the system packages an app needs (GTK, libnotify,
  NSS, …) for a given Electron version, from a distro-specific dependency map.
* **Utilities**: file templating, package-name sanitization, error wrapping, and a promisified
  `spawn`.

## Requirements

Requires Node.js 22.12.0 or greater.

This package is ESM-only:

```javascript
import { ElectronInstaller } from 'electron-installer-common';
```

## Legal

This project is copyrighted under the Apache License (version 2). See LICENSE for details.
