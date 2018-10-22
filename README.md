# themis-web-interface

[![Build Status](https://travis-ci.org/natsukagami/themis-web-interface.svg?branch=master)](https://travis-ci.org/natsukagami/themis-web-interface)

A web interface for Themis, written in Node.js

- [themis-web-interface](#themis-web-interface)
	- [Running](#running)
		- [From prebuilt archive](#from-prebuilt-archive)
		- [From source](#from-source)
	- [Configuration](#configuration)
	- [Building](#building)
	- [Contributing](#contributing)
		- [LF / CRLF Problem](#lf--crlf-problem)
	- [Current Implementation Status](#current-implementation-status)

## Running

### From prebuilt archive

The most straightforward way to run is to download a prebuilt version of the project [here](https://github.com/natsukagami/themis-web-interface/releases). This includes all production required modules, as well as a bundled Node.js executable (Windows only) and a batch script file to quickly start the server (Windows only, again).
After downloading, extract the archive, do the [configuration](#configuration) and execute `run.bat`. The script will setup proper environment variables and launch the server.

### From source

In addition to the source code, you should have the following apps/scripts installed:

- [Node.js](http://nodejs.org) version >= 8 alongside npm

After cloning the source code open a terminal and type:

```
npm install
```

When the module installation finishes you can start the server anytime with:

```
npm start
```

## Configuration

The most basic configurations are available in `config.js`, which includes:

- Contest name
- Toggle scoreboard function
- Contest mode, which includes:

* Timing for submit
* Contest clock
* Hiding results before contest ends

Accounts are automatically parsed from `data\account.xml` (I know, WTF, but it keeps backwards-compability with the old web server. Furthermore, it supports editing from Excel.)

Themis' online submitting directory should be changed to `data\submit`. There's currently no way to change that (there will be in the future).

Any public files should be put into `data\files` directory. It will automatically be cached into the server to avoid LFI attacks.

## Building

For best compatibility with my own build scripts I recommend using [yarn](https://yarnpkg.com) over npm. Currently the build scripts should work fine with npm however this is not promised in the future.

First run `yarn` (`npm install` with npm) to install all build modules. This could take some time, as there are lots of modules required.

Open a terminal within the source code's root folder and type `yarn build` (`npm build` with npm) to build the `.zip` package. It will be available in the `dist` folder.

## Contributing

Please follow the ESLint restrictions included with the source code. I am glad to look at any problem you face and will kindly respond to all legitimate PRs so do not hesitate. Feature requests are also welcomed, however if you only come up with the idea and no details or any intent to code / help me out with its implementation, please go away.

### LF / CRLF Problem

All code files ends a line with `LF`. Only real data files (e.g. log files in `testdata/`) can be allowed to end with CRLF. I will disaprove any PR using CRLF.

## Current Implementation Status

- [x] Basic functions (submitting, judge result receiving).
- [x] Account parsing.
- [x] Account registration.
- [x] Account modification.
- [x] Offline submission saving with `localStorage`.
- [ ] Online submission saving.
- [x] Judge result parsing.
- [x] Public file serving.
- [x] Web code editor.
- [x] More lightweight JS file (now gzipped to under 512kB!).
- [x] Auto update.
- [x] Scoreboard.
