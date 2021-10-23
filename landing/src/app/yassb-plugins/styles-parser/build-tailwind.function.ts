import autoprefixer from 'autoprefixer';
import CleanCSS from 'clean-css';
import { readFileSync } from 'fs-extra';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';

export const buildTailwind = async (pathToCssFile, from, to): Promise<string> => {
  // process.env.NODE_ENV = 'production';
  const css = readFileSync(pathToCssFile);
  const result = await postcss([tailwindcss, autoprefixer]).process(css, {
    from,
    to,
    map: false
  });

  const minified = new CleanCSS().minify(result.css);
  return minified.styles;
};
