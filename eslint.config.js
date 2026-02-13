const { FlatCompat } = require('@eslint/eslintrc');
const prettierConfig = require('eslint-config-prettier');

const compat = new FlatCompat({
  baseDirectory: process.cwd(),
});

module.exports = [
  ...compat.extends('expo'),
  prettierConfig,
  {
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'build/**'],
  },
];
