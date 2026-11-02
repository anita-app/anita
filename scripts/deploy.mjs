/**
 * Publishes anita-app.com: the GitHub Pages repository anita-app/anita-app.github.io, served from its main branch.
 *
 *   yarn deploy             build what has a newer version, commit and push
 *   yarn deploy --dry-run   same, but stop before the push and print where the commit is
 *
 * The root package.json holds two versions: appVersion (the app at /v1/) and landingVersion (the website). The
 * package.json of the Pages repository records the published ones. Only the parts whose version is newer are
 * built and replaced, in a single commit that also records the new versions:
 *
 * - app: `yarn build-app` into a temporary folder, which replaces v1/;
 * - landing: the licenses lists, then the YASSB build into a temporary folder (it post-processes every HTML file
 *   of its output, so it must not run on the published folder), which replaces everything except the folders
 *   of the apps (app/ is the previous version, 0.20, and is never rebuilt), CNAME and package.json.
 *
 * The local anita-app.github.io/ folder is not used, so this works while dev servers are running.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { PAGES_REPO, PAGES_BRANCH, plan, readSourceVersions, describe } = require('./deploy-versions.cjs');

/** Folder of the Pages repository where the app is served (anita-app.com/v1/). */
const APP_FOLDER = 'v1';
/** Entries of the Pages repository that are not part of the landing. */
const NOT_LANDING = new Set(['.git', 'CNAME', 'package.json', 'app', APP_FOLDER]);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const temporaryFolders = [];

function temporaryFolder(prefix) {
  const folder = mkdtempSync(join(tmpdir(), prefix));
  temporaryFolders.push(folder);
  return folder;
}

function cleanUp(keep) {
  for (const folder of temporaryFolders)
    if (folder !== keep) rmSync(folder, { recursive: true, force: true });
}

function run(command, args, cwd, env) {
  return execFileSync(command, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' }).trim();
}

function runVisible(command, args, cwd, env) {
  execFileSync(command, args, { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
}

function step(message) {
  console.log(`\n▸ ${message}`);
}

function replaceFolderContent(target, source) {
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

function buildApp(clone) {
  step('Building the app');
  const output = temporaryFolder('anita-app-');
  // `yarn build` checks the feature catalogue and the types, then runs `vite build`, which receives --outDir.
  runVisible('yarn', ['workspace', 'anita-app', 'build', '--outDir', output], root);
  replaceFolderContent(join(clone, APP_FOLDER), output);
}

function buildLanding(clone) {
  step('Building the licenses lists of the landing');
  runVisible('npm', ['run', 'licenses'], join(root, 'landing'));
  runVisible('yarn', ['workspace', 'anita-app', 'licenses'], root);

  step('Building the landing');
  const output = temporaryFolder('anita-landing-');
  // YASSB reads its configuration with the `config` package: NODE_CONFIG overrides the output folder.
  runVisible('npm', ['run', 'build'], join(root, 'landing'), { NODE_CONFIG: JSON.stringify({ workingDir: { out: output } }) });

  for (const entry of readdirSync(clone))
    if (!NOT_LANDING.has(entry)) rmSync(join(clone, entry), { recursive: true, force: true });
  for (const entry of readdirSync(output))
    if (!NOT_LANDING.has(entry)) cpSync(join(output, entry), join(clone, entry), { recursive: true });
}

function main() {
  const source = readSourceVersions();

  step(`Cloning ${PAGES_REPO}`);
  const clone = temporaryFolder('anita-pages-');
  run('git', ['clone', '--quiet', '--depth', '1', '--branch', PAGES_BRANCH, `https://github.com/${PAGES_REPO}.git`, clone], root);
  const publishedPackage = JSON.parse(readFileSync(join(clone, 'package.json'), 'utf8'));

  // Recheck the destination even after the workflow's early check (or when run by hand).
  const rows = plan(source, publishedPackage);
  console.log(describe(rows).join('\n'));
  const toDeploy = rows.filter(row => row.deploy);
  if (!toDeploy.length) {
    console.log('\nNo newer version: nothing to deploy.');
    return cleanUp();
  }

  step('Writing the versions into the app and the landing');
  runVisible('node', ['version-propagator.js'], root);

  for (const row of toDeploy) {
    if (row.id === 'app') buildApp(clone);
    if (row.id === 'landing') buildLanding(clone);
    publishedPackage[row.key] = row.source;
  }
  // Publish the versions with the files they describe, keeping the other fields.
  writeFileSync(join(clone, 'package.json'), `${JSON.stringify(publishedPackage, null, 2)}\n`);

  run('git', ['add', '-A'], clone);
  const sha = run('git', ['rev-parse', '--short', 'HEAD'], root);
  const what = toDeploy.map(row => `${row.id} ${row.source}`).join(', ');
  run('git', ['commit', '--quiet', '-m', `Deploy ${what} (anita ${sha})`], clone);
  console.log(run('git', ['show', '--stat', '--format=%h %s', 'HEAD'], clone).split('\n').slice(-1)[0]);

  if (dryRun) {
    console.log(`\nDry run: commit ready in ${clone}, not pushed.`);
    return cleanUp(clone);
  }

  step('Pushing');
  runVisible('git', ['push', '--quiet', 'origin', PAGES_BRANCH], clone);
  cleanUp();
  console.log(`\nDeployed ${what}: https://anita-app.com (GitHub Pages updates in a minute or two).`);
}

try {
  main();
} catch (error) {
  cleanUp();
  console.error(`\n${error.message}`);
  process.exitCode = 1;
}
