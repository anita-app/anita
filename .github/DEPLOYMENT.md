# Automatic deployment of anita-app.com

anita-app.com is the GitHub Pages site of the separate repository **anita-app/anita-app.github.io**
(branch `main`, folder `/`). It contains:

- the landing (website), at the root;
- the app, at `/v1/`;
- the previous version of the app (0.20), at `/app/`, kept as it is and never rebuilt.

Every push to `main` in **anita-app/anita** (including a release merged by `cglg release finish`) starts
`.github/workflows/deploy.yml`. Development stays on `develop`.

## Versions

The root `package.json` has one version for each published part:

- `appVersion`: the app at `/v1/`;
- `landingVersion`: the landing.

`yarn propagate-version` copies them into `app/package.json`, `landing/package.json` and their `version.ts`
files. The `version` field is the release of the repository, managed by `cglg` with the changelog.

The `package.json` of the Pages repository records the published `appVersion` and `landingVersion`. Before
installing anything, the first job of the workflow (`scripts/deploy-versions.cjs`) compares the two pairs:

- source newer than published: that part is built and published;
- source equal or older: that part is skipped (nothing is installed or built if both are skipped);
- missing or invalid versions, or the Pages repository cannot be read: the check fails and nothing is deployed.

So a change to the app only needs a higher `appVersion`, and the landing is not rebuilt; a change to the landing
needs a higher `landingVersion`. A part whose version did not change is not published, even if its code changed.

The deploy job installs the dependencies, runs the app tests and `scripts/deploy.mjs`, which rechecks the
versions, builds what is newer, replaces it in a clone of the Pages repository and pushes one commit, which also
updates the versions in its `package.json`. Deploys run one at a time; a failed build, test or push publishes
nothing and does not mark a version as published.

The workflow can also be started from **Actions → Deploy anita-app.com from main → Run workflow** on `main`.

## One-time setup

1. Create a fine-grained personal access token with resource owner `anita-app`, access only to
   `anita-app.github.io`, and **Contents: Read and write**. Set an expiration you can keep track of.
2. In **anita-app/anita → Settings → Secrets and variables → Actions**, add a repository secret named
   **PAGES_DEPLOY_TOKEN** containing that token.
3. In **anita-app/anita-app.github.io → Settings → Pages**, the source is **Deploy from a branch**, branch
   **main**, folder **/ (root)**.

The automatic `GITHUB_TOKEN` cannot write to another repository; the dedicated token is given only to the Git
commands of the deploy step, scoped to the Pages repository, without putting it in the remote URL. Renew the
secret when the token expires.

## By hand

`yarn deploy --dry-run` does everything except the push and prints where the commit is; `yarn deploy` also pushes
(with your Git credentials). Both need the dependencies of the app (`yarn install`) and, for the landing, of
`landing/` (`npm install` there).
