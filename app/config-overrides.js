const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const webpack = require('webpack');
module.exports = function override(config, env) {
  config.plugins.push(
    new NodePolyfillPlugin()
  )
  config.externals = { fs: 'fs', }
  return config;
}
