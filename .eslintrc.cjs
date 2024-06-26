/** @type {import('eslint').ESLint.ConfigData} */
const config = {
  extends: ['./node_modules/gts', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    eqeqeq: ['error', 'always', {null: 'ignore'}],
  },
  overrides: [
    {
      files: [
        'packages/script-utils/src/**/*',
        '**/vite.config.*',
        '**/scripts/**/*',
      ],
      rules: {
        'no-process-exit': 'off',
        'node/no-unpublished-import': 'off',
      },
    },
    {
      files: ['**/*.html'],
      plugins: ['@html-eslint'],
      extends: ['plugin:@html-eslint/recommended'],
      parser: '@html-eslint/parser',
      rules: {
        '@html-eslint/indent': ['error', 2],
        '@html-eslint/lowercase': 'error',
        '@html-eslint/no-extra-spacing-attrs': [
          'error',
          {enforceBeforeSelfClose: true},
        ],
        '@html-eslint/no-inline-styles': 'error',
        '@html-eslint/no-multiple-empty-lines': ['error', {max: 1}],
        '@html-eslint/no-script-style-type': 'error',
        '@html-eslint/no-target-blank': 'error',
        '@html-eslint/no-trailing-spaces': 'error',
        '@html-eslint/require-closing-tags': 'error',
        '@html-eslint/require-meta-charset': 'error',
        '@html-eslint/require-meta-viewport': 'error',
      },
    },
    {
      files: ['**/*.jsx', '**/*.tsx'],
      rules: {
        'jsx-quotes': ['error', 'prefer-double'],
      },
    },
    {
      files: ['**/*.json'],
      extends: ['plugin:jsonc/recommended-with-jsonc'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/array-bracket-newline': 'error',
        'jsonc/array-bracket-spacing': 'error',
        'jsonc/array-element-newline': 'error',
        'jsonc/comma-dangle': 'error',
        'jsonc/indent': ['error', 2],
        'jsonc/key-spacing': 'error',
        'jsonc/object-curly-newline': 'error',
        'jsonc/object-curly-spacing': 'error',
        'jsonc/object-property-newline': 'error',
      },
    },
    {
      files: ['**/*.md'],
      extends: ['plugin:markdownlint/recommended'],
      parser: 'eslint-plugin-markdownlint/parser',
    },
    {
      files: ['**/*.yaml'],
      extends: ['plugin:yml/standard'],
      parser: 'yaml-eslint-parser',
    },
  ],
};

module.exports = config;
