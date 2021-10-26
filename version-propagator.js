const fs = require('fs-extra');

function start() {
  const currentJson = fs.readJSONSync('./package.json');
  updateChildPackage('app', currentJson.version);
  updateChildPackage('landing', currentJson.version);
  storeVersionInTsFile('app', currentJson.version);
  storeVersionInTsFile('landing', currentJson.version);
}

function updateChildPackage(folder, version) {
  const file = `./${folder}/package.json`;
  const child = fs.readJSONSync(file);
  child.version = version;
  fs.writeJSONSync(file, child, { spaces: 2 });
}

function storeVersionInTsFile(folder, version) {
  const file = `./${folder}/src/app/version.ts`;
  const contents = `/**\n * Auto generated file, do not edit.\n */\n\nexport const appVersion = '${version}';\n`;
  fs.writeFileSync(file, contents);
}

start()