require('ts-node/register/transpile-only');

const { DateFormatterDirective } = require('../src/app/yassb-plugins/custom-directives/date-formatter-directive.class');
const { blogList } = require('../src/app/yassb-plugins/custom-renderers/blog-list');
const { packagesList } = require('../src/app/yassb-plugins/custom-renderers/packages-list');
const { addDivToPreCode } = require('../src/app/yassb-plugins/post-processors/add-div-to-pre-code.function');
const { buildTailwind } = require('../src/app/yassb-plugins/styles-parser/build-tailwind.function');

module.exports = {
  workingDir: {
    out: '../anita-app.github.io',
    styles: 'styles/styles.css'
  },
  stylesParser: buildTailwind,
  customRenderers: {
    blogList: blogList,
    packagesList: packagesList
  },
  customDirectives: [DateFormatterDirective],
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
};
