import { readFileSync } from 'fs-extra';
import path from 'path';
import postcss from 'postcss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const loadConfig = require('postcss-load-config');

export const buildTailwind = async (pathToCssFile, from, to): Promise<string> => {
  // process.env.NODE_ENV = 'production';
  const css = readFileSync(pathToCssFile);
  const cwd = path.resolve(path.dirname(pathToCssFile), '../../../');
  const { plugins, options } = await loadConfig({}, cwd);
  const result = await postcss(plugins).process(css, {
    ...options,
    from,
    to,
    map: false
  });

  return result.css;
};
