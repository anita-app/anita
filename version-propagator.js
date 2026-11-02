// The root package.json holds the version of each published part: appVersion for the app (anita-app.com/v1/),
// landingVersion for the website. This copies each one into its package.json and its generated version.ts.
const fs = require('fs-extra');

function start() {
  const root = fs.readJSONSync('./package.json');
  propagate('app', 'appVersion', root.appVersion);
  propagate('landing', 'landingVersion', root.landingVersion);
}

function propagate(folder, constName, version) {
  if (typeof version !== 'string' || !version)
    throw new Error(`Missing ${constName} in the root package.json`);
  const file = `./${folder}/package.json`;
  const child = fs.readJSONSync(file);
  child.version = version;
  fs.writeJSONSync(file, child, { spaces: 2 });
  const contents = `/**\n * Auto generated file, do not edit.\n */\n\nexport const ${constName} = '${version}'\n`;
  fs.writeFileSync(`./${folder}/src/app/version.ts`, contents);
}

start()
