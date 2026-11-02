// Decides what to publish: compares appVersion and landingVersion of the root package.json with the versions
// recorded in the package.json of the GitHub Pages repository (anita-app/anita-app.github.io, branch main).
// No dependencies: the workflow runs this before installing anything.
//
//   node scripts/deploy-versions.cjs   prints the plan; in GitHub Actions also writes deploy_app/deploy_landing
const { appendFileSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const PAGES_REPO = 'anita-app/anita-app.github.io';
const PAGES_BRANCH = 'main';
/** The parts of the site, each with its own version in the root package.json. */
const PARTS = [
  { id: 'app', key: 'appVersion', label: 'App (/v1/)' },
  { id: 'landing', key: 'landingVersion', label: 'Landing' },
];

function parseVersion(version) {
  const match = typeof version === 'string' && /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(version);
  if (!match) throw new Error(`Invalid version: ${String(version)}`);
  const prerelease = match[4] ? match[4].split('.') : [];
  return { core: match.slice(1, 4).map(BigInt), prerelease };
}

/** SemVer comparison: 1 if left is newer, -1 if older, 0 if equal. */
function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  for (let i = 0; i < 3; i++)
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i] ? 1 : -1;
  if (!a.prerelease.length || !b.prerelease.length)
    return Number(!a.prerelease.length) - Number(!b.prerelease.length);
  for (let i = 0; i < Math.max(a.prerelease.length, b.prerelease.length); i++) {
    const x = a.prerelease[i], y = b.prerelease[i];
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    if (x === y) continue;
    const xn = /^[0-9]+$/.test(x), yn = /^[0-9]+$/.test(y);
    if (xn && yn) return BigInt(x) > BigInt(y) ? 1 : -1;
    if (xn !== yn) return xn ? -1 : 1;
    return x > y ? 1 : -1;
  }
  return 0;
}

function readSourceVersions() {
  return JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));
}

/** For each part: source and published version, and whether the source is newer. */
function plan(source, published) {
  return PARTS.map(part => {
    const from = source[part.key];
    const to = published[part.key];
    parseVersion(from);
    parseVersion(to);
    return { ...part, source: from, published: to, deploy: compareVersions(from, to) > 0 };
  });
}

async function fetchPublishedVersions() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'anita-deploy-version-check', 'Cache-Control': 'no-cache' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com/repos/${PAGES_REPO}/contents/package.json?ref=${PAGES_BRANCH}`, {
    headers,
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Cannot read the published package.json: HTTP ${response.status}`);
  const file = await response.json();
  if (file.encoding !== 'base64' || typeof file.content !== 'string')
    throw new Error('Unexpected response for the published package.json');
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

function describe(rows) {
  return rows.map(row => `${row.label}: source ${row.source}, published ${row.published}. ${row.deploy ? 'Newer: build and deploy.' : 'Not newer: skip.'}`);
}

async function main() {
  const rows = plan(readSourceVersions(), await fetchPublishedVersions());
  const lines = describe(rows);
  console.log(lines.join('\n'));
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, rows.map(row => `deploy_${row.id}=${row.deploy}\n`).join('') + `deploy_any=${rows.some(row => row.deploy)}\n`);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.map(line => `- ${line}\n`).join(''));
}

module.exports = { PAGES_REPO, PAGES_BRANCH, PARTS, compareVersions, plan, readSourceVersions, describe };
if (require.main === module) main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
