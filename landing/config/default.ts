import { YassbConfig } from 'yassb-web';
import { featuresList } from '../src/app/yassb-plugins/custom-renderers/features-list';
import { buildTailwind } from '../src/app/yassb-plugins/styles-parser/build-tailwind.function';

export default {
  workingDir: {
    out: '../dist',
    styles: 'styles/styles.css'
  },
  stylesParser: buildTailwind,
  customRenderers: {
    featuresList: featuresList
  },
  htmlMinificationOptions: {
    removeAttributeQuotes: false,
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true
  }
} as YassbConfig;
