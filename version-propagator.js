const fs = require('fs-extra');

function start() {
  const currentJson = fs.readJSONSync('./package.json');
  updateChildPackage('app', currentJson.version);
  updateChildPackage('landing', currentJson.version);
}

function updateChildPackage(folder, version) {
  const file = `./${folder}/package.json`;
  const child = fs.readJSONSync(file);
  child.version = version;
  fs.writeJSONSync(file, child, { spaces: 2 });
}

start()