module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    node: true,
    mocha: true
  },
  root: true,
  extends: [
    'standard',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended'
    // 'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'eslint-plugin-import',
    'eslint-plugin-react'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    impliedStrict: true
  },
  rules: {
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'warn',
    // '@typescript-eslint/no-use-before-define': 'warn'
    'import/first': 'off',
    '@typescript-eslint:disable:ordered-imports': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'React' }],
    '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'none' } }],
    'no-useless-constructor': 'off',
    '@typescript-eslint/array-type': [2, { default: 'generic' }],
    '@typescript-eslint/explicit-member-accessibility': ['error', {
      accessibility: 'explicit',
      ignoredMethodNames: ['render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'componentDidCatch', 'shouldComponentUpdate', 'getDerivedStateFromProps', 'getDerivedStateFromError'],
      overrides: { constructors: 'off', properties: 'off' }
    }],
    'react/function-component-definition': [2, { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }],
    'no-else-return': 'error',
    'no-return-assign': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'import/order': ['error', {
      pathGroups: [
        {
          pattern: 'app/**',
          group: 'internal',
          position: 'after'
        }
      ],
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type']
    }],
    'react/jsx-wrap-multilines': ['error', { declaration: true, assignment: true, return: true, arrow: true, logical: true }],
    'react/jsx-closing-bracket-location': ['error'],
    'react/jsx-closing-tag-location': ['error'],
    'react/jsx-curly-spacing': ['error', 'never'],
    'react/jsx-curly-newline': ['error', 'never'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-first-prop-new-line': ['error'],
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-props-no-multi-spaces': ['error'],
    'react/jsx-boolean-value': ['error', 'always']
    // TO BE EVALUATED
    // 'padding-line-between-statements': ['error', { blankLine: 'always', prev: 'block-like', next: 'return' }]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
