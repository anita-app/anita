const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')

module.exports = function override (config) {
  const rulesWithOneOf = config.module.rules.find(rule => Array.isArray(rule.oneOf))
  const babelLoader = rulesWithOneOf?.oneOf?.find(
    rule => rule.loader && rule.loader.includes('babel-loader') && rule.options
  )
  if (babelLoader) {
    const compilerPlugin = require.resolve('babel-plugin-react-compiler')
    const plugins = babelLoader.options.plugins || []
    const hasCompilerPlugin = plugins.some(
      plugin => plugin === compilerPlugin || (Array.isArray(plugin) && plugin[0] === compilerPlugin)
    )
    if (!hasCompilerPlugin) {
      babelLoader.options.plugins = [...plugins, compilerPlugin]
    }
  }

  config.plugins.push(
    new NodePolyfillPlugin()
  )
  config.externals = { fs: 'fs' }
  config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin))
  return config
}
