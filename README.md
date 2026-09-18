# OpenMRS ESM ICRC


## Introduction 
This repository contains the source code for various OpenMRS 3.x widgets specific to ICRC use-cases. As a general principle, we try to reuse community assests wherever possible. However, to deal with certain requirements that the ICRC has that are particular to its programs, we occassionally will need to provide some custom components. Those will all live here.

This repository is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) that uses [Yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces) to manage code, [Turbo](https://turborepo.org/) to handle builds, and [Lerna](https://lerna.js.org/) to handle versioning and publishing.


# Access to ICRC Nexus instance
ICRC staff: see the page "How to connect to Nexus with npm and yarn" in the internal DevOps wiki.

# Corepack, offline installation and corepack.tgz
- use `corepack enable` to activate corepack. 

As on CI the internet accessible is not guarantee, we use the offline approach to install yarn and the package is stored in `corepack.tgz`.
See https://github.com/nodejs/corepack#offline-workflow


# How to update yarn
1. `yarn set version stable` to use the last stable version
2. `corepack pack` to update the offline package `corepack.tgz`

## Before pushing your modifications


1. Run `yarn  install --frozen-lockfile`
1. Run `yarn  run verify` (does lint / typescript )
1. Run `yarn jest --coverage` (does  test and coverage)
1. Run `yarn dlx turbo run build`


## Getting Started
Obviously, first you need to checkout this repository locally.

To start a dev server for a specific package, run:

```sh
yarn start --sources 'packages/esm-icrc-<insert-package-name>-app'
```

This command uses the [openmrs](https://www.npmjs.com/package/openmrs) tooling to start a dev server running the specified microfront end.

To run multiple packages, you can use:

```sh
yarn start --sources 'packages/esm-icrc-<insert-first-package>-app' --sources 'packages/esm-icrc<insert-second-package>-app'.
```

Note that running multiple frontend modules will require more computing resources on your local machine per frontend.

## Build and Test
Because this is a monorepo, each of the folders under `/packages` is expected to be a relatively self-contained project that provides scripts called:

* `build` - run Webpack to build the code into it's transpiled form
* `lint` - runs ESLint against the source code in the repo
* `typescript` - runs tsc against the source code in the repo

To build all projects at once, helper scripts are provided so that all packages can be tested with:

```sh
yarn run verify
```

And can be built with:

```sh
yarn run build
```

However, because we use turbo for building, there may be some environments, e.g., CI, that can benefit from more customised commands. Please see the scripts in `package.json` for the actual content of the high-level scripts.


## Adding a new package
New packages should go as a folder in the `packages` section. Ideally, new packages should either be modified from existing frontend modules for from the [`openmrs-esm-template-app`](https://github.com/openmrs/openmrs-esm-template-app). This simplifies the process of creating a new frontend module by providing a good starting point. Note that if you are copying from `openmrs-esm-template-app`, you generally will not need a separate `yarn.lock` file or the various configuration files. Usually is should be sufficient to copy `package.json` and `webpack.config.js`.



## Pipelines

Publishing runs on GitHub Actions. All workflows are currently manual (`workflow_dispatch`) while the npm publishing setup is being stabilized:

- [`build.yml`](./.github/workflows/build.yml): lint, type check, test and build.
- [`publish.yml`](./.github/workflows/publish.yml): publishes to npm. Leave the `release` input unchecked for a pre-release on the `pre` dist-tag, or check it for a full release, which also tags the commit and opens the version-bump pull request.
- [`codeql-analysis.yml`](./.github/workflows/codeql-analysis.yml): CodeQL code scanning.
- [`bootstrap-npm.yml`](./.github/workflows/bootstrap-npm.yml): one-off, creates the `@icrc/*` package names on npmjs.org. See the comment at the top of that file.
