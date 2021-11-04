import { YassbConfig } from 'yassb-web';
import { blogList } from '../src/app/yassb-plugins/custom-renderers/blog-list';
import { featuresList } from '../src/app/yassb-plugins/custom-renderers/features-list';
import { addDivToPreCode } from '../src/app/yassb-plugins/post-processors/add-div-to-pre-code.function';
import { buildTailwind } from '../src/app/yassb-plugins/styles-parser/build-tailwind.function';

export default {
  workingDir: {
    out: '../anita-app.github.io',
    styles: 'styles/styles.css'
  },
  stylesParser: buildTailwind,
  customRenderers: {
    featuresList: featuresList,
    blogList: blogList
  },
  htmlMinificationOptions: {
    removeAttributeQuotes: false,
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true
  },
  grayMatterOption: {
    excerpt: true,
    excerpt_separator: '<!-- /preview -->'
  },
  postProcessors: [addDivToPreCode]
} as YassbConfig;
