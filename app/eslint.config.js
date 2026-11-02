import { defineConfig, globalIgnores } from 'eslint/config'
import { neostandard } from 'neostandard'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importX from 'eslint-plugin-import-x'

// The JSX formatting is checked by the eslint-plugin-react rules below, as before: neostandard's own JSX style layer
// would report a different style.
const standard = neostandard({ ts: true, env: ['browser', 'mocha'] })
  .filter(config => config.name !== 'neostandard/style/jsx')

export default defineConfig([
  globalIgnores(['src/service-worker.js']),
  ...standard,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'import-x': importX,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-use-before-define': 'off',
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',
      // As in standard 17: JSX is indented by react/jsx-indent and react/jsx-indent-props.
      '@stylistic/indent': ['error', 2, {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false,
        ignoredNodes: ['TemplateLiteral *', 'TSTypeParameterInstantiation', 'JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXFragment', 'JSXOpeningFragment', 'JSXClosingFragment', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild'],
        offsetTernaryExpressions: true,
      }],
      '@stylistic/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
      'react/function-component-definition': ['error', { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }],
      'no-else-return': 'error',
      'no-return-assign': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'import-x/order': ['error', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'] }],
      'react/jsx-wrap-multilines': ['error', { declaration: true, assignment: true, return: true, arrow: true, logical: true }],
      'react/jsx-closing-bracket-location': ['error'],
      'react/jsx-closing-tag-location': ['error'],
      'react/jsx-curly-spacing': ['error', 'never'],
      'react/jsx-curly-newline': ['error', 'never'],
      'react/jsx-equals-spacing': ['error', 'never'],
      'react/jsx-first-prop-new-line': ['error', 'multiprop'],
      'react/jsx-indent': ['error', 2],
      'react/jsx-indent-props': ['error', 2],
      'react/jsx-props-no-multi-spaces': ['error'],
      'react/jsx-boolean-value': ['error', 'always'],
      'react/destructuring-assignment': ['error', 'never'],
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Prefer named exports',
        },
        {
          selector: 'ImportDeclaration[source.value=\'react\'][specifiers.0.type=\'ImportDefaultSpecifier\']',
          message: 'Default React import not allowed',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'table', 'stack', 'debug'] }],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      'react/jsx-max-props-per-line': ['warn', { maximum: 1, when: 'always' }],
      'react/jsx-child-element-spacing': ['warn'],
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    // The TypeScript plugin is defined only for TypeScript files.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-use-before-define': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', disallowTypeAnnotations: false, fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-member-accessibility': ['error', {
        accessibility: 'explicit',
        ignoredMethodNames: ['render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'componentDidCatch', 'shouldComponentUpdate', 'getDerivedStateFromProps', 'getDerivedStateFromError'],
        overrides: { constructors: 'off', properties: 'off' },
      }],
    },
  },
  {
    // Configuration files: default exports are what the tools expect.
    files: ['*.config.{js,ts}'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
])
