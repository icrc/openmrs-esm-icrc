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
- [`publish.yml`](./.github/workflows/publish.yml): publishes to npm. See [Publishing](#publishing) below.
- [`codeql-analysis.yml`](./.github/workflows/codeql-analysis.yml): CodeQL code scanning.

The original triggers are commented out in each file rather than deleted, with a note on when to restore them. CodeQL additionally has to be re-enabled from the Actions tab, because GitHub marks a workflow left without triggers as disabled rather than simply idle.


## Publishing

### Versioning

Lerna runs in fixed mode, so `lerna.json` holds one version that all packages share. The `version` fields in the individual `packages/*/package.json` files are overwritten by `lerna version` during the build and are only there to keep local tooling happy. To change the release line, change `lerna.json`.

### Running a publish

Dispatch [`publish.yml`](./.github/workflows/publish.yml) from the Actions tab. Two inputs control what happens:

| `release` | `bump` | Result |
| --- | --- | --- |
| unchecked | ignored | Publishes `<version>-pre.<run number>` on the `pre` dist-tag. Nothing is tagged and `main` is untouched. |
| checked | `patch` | Publishes `<version>`, claims the `latest` tag, tags the commit, then opens a pull request lining `main` up for the next patch. |
| checked | `minor` | As above, lining `main` up for the next minor. This is the default. |
| checked | `major` | As above, lining `main` up for the next major. |
| checked | `none` | Publishes and tags only. `main` is left alone. |

The version bump arrives as a pull request, so it has to be merged to prepare `main` for the next cycle.

Until it is merged, `main` still carries the version just released. A pre-release dispatched in that window therefore republishes a `-pre.N` of it, sorting below the release. Harmless on the `pre` tag, but it reads oddly.

### Releasing a patch

Releasing `4.0.1` after `4.0.0` is a matter of choosing `bump: patch` when releasing `4.0.0`, which lines `main` up for `4.0.1` instead of `4.1.0`.

A hotfix is different: `main` has moved on and the patch must ship without the work that landed since. Cut a branch from the release tag and cherry-pick the fix. Set the version with `yarn lerna version 4.0.1 --no-git-tag-version --no-push --yes`. Dispatch from that branch with `bump: none`, so it leaves `main` alone.

Note that the commit tagged by a release is whichever commit was dispatched, so check the branch before releasing.

### Authentication and provenance

The workflow holds no npm token. It authenticates with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) over OIDC, which is why the job declares `environment: npm` and the workflow requests `id-token: write`. Trusted publishing is configured per package, matching on the repository, the workflow filename and the environment name.

Each published version carries a [provenance attestation](https://docs.npmjs.com/generating-provenance-statements/) linking it to the commit and workflow run that produced it. This requires the repository to stay public and each manifest to declare a `repository` that matches this repository. Making the repository private again would break provenance, and the publish would fail rather than silently degrade.

### Adding a package to the publish

Adding a package to `packages/` is not enough. A name that has never been published needs the steps below, in this order, and until they are done `publish.yml` fails on it and stops, because it publishes topologically.

A package that has never been published makes `publish.yml` stop with:

```
The command failed in workspace @icrc/<package-name>@workspace:packages/<package-name> with exit code 1
The command failed for workspaces that are depended upon by other workspaces; can't satisfy the dependency graph
```

Confirm with `npm view @icrc/<package-name> dist-tags`. A 404 means the name does not exist yet.

> **Prerequisite:** steps 1 and 2 run under your own npm account, which must be a member of the [`icrc` organization on npmjs.org](https://www.npmjs.com/org/icrc) with publish rights on the `@icrc` scope.
>
> Check with `npm org ls icrc <your-npm-username>`. If you are not a member, ask an owner of the organization to invite you first, otherwise the publish is refused.

The examples below use `@icrc/esm-icrc-contextual-info-app`. Replace it with the name of your package.

**0. Check the manifest.** Copy these fields from an existing package into the new `package.json`, adjusting `directory`:

```json
"license": "BSD-3-Clause",
"repository": {
  "type": "git",
  "url": "git+https://github.com/icrc/openmrs-esm-icrc.git",
  "directory": "packages/esm-icrc-contextual-info-app"
},
"publishConfig": {
  "access": "public"
}
```

Without `repository` the provenance check fails. Without `access: public` npm treats a scoped package as restricted and refuses it.

**1. Create the name on npmjs.org.** Trusted publishing cannot do this. A trusted publisher is configured on a package settings page that only exists once the package has been published, so the very first publish of a name has to be authenticated as a person. Publish one throwaway version by hand, from the root of the repository:

```sh
corepack enable
npm login
yarn install --immutable
yarn turbo run build --filter=@icrc/esm-icrc-contextual-info-app
cd packages/esm-icrc-contextual-info-app
ORIG_VERSION="$(node -p "require('./package.json').version")"
npm pkg set version="$(node -p "require('../../lerna.json').version")-bootstrap.0"
npm publish --access public --tag bootstrap
npm pkg set version="$ORIG_VERSION"
cd ../..
```

Add `--dry-run` to `npm publish` first to check the name, version, access and tag without publishing anything.

`npm login` and `npm publish` both open a browser two-factor challenge.

The `-bootstrap.0` suffix sorts below the `-pre.N` versions from `publish.yml`, and the `bootstrap` dist-tag keeps it away from `pre`. npm still points `latest` at the first version published whatever the tag, and the first real release moves it on. The last `npm pkg set` puts the original version back, because the stamp must not be committed.

Run it interactively as yourself. If a token is unavoidable, use a classic Automation token. A granular token that bypasses two-factor authentication loses direct publish capability from January 2027.

**2. Configure the trusted publisher.** For a single new package:

```sh
npm trust github @icrc/esm-icrc-contextual-info-app \
  --repo icrc/openmrs-esm-icrc --file publish.yml --env npm --allow-publish --yes
```

To go through every workspace instead:

```sh
./tools/configure-npm-trust.sh
```

Read the header of that script first. Both routes need npm 11.15.0 or later (`npm install -g npm@latest`), a real terminal for the browser two-factor challenge, and a login that is not a token which bypasses two-factor authentication. Use `./tools/configure-npm-trust.sh --verify-only` to report what is currently configured.

If step 2 is skipped, the publish fails with a 404, which is the same response npm gives for a package that does not exist. The message does not distinguish the two cases, so check `--verify-only` before assuming which one you have hit.

**3. Validate.** Dispatch `publish.yml` with `release` unchecked. The new package should now appear on the `pre` dist-tag alongside the others.

For a batch of new packages, or for another repository facing the same problem, [`tools/bootstrap-npm.yml.template`](./tools/bootstrap-npm.yml.template) is the workflow that did step 1 for the original sixteen in a single run.

Copy it to `.github/workflows/`, run it once, then delete it and revoke its token.

Its header lists what to adapt. The version stamping and the publish command are specific to a fixed mode monorepo, and the token must be a classic Automation token rather than a granular one that bypasses two-factor authentication.

It is kept as a template rather than a live workflow so that nothing holding an npm token sits in `.github/workflows/` once the names exist.
