const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['prettier', '@typescript-eslint'],
  extends: [
    'eslint-config-airbnb-base',
    'airbnb-typescript/base',
    'prettier',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-bitwise': ['error', { allow: ['&', '|', '^'] }],
    // 'arrow-body-style': [2, 'as-needed'],
    // 'arrow-parens': ['error', 'as-needed'],
    // 'class-methods-use-this': 0,
    // 'comma-dangle': [2, 'always-multiline'],
    // 'no-underscore-dangle': 0,
    // 'newline-per-chained-call': 0,
    // 'no-confusing-arrow': 0,
    indent: 0,
    'no-console': [isProd ? 'error' : 'warn', { allow: ['warn', 'error'] }],
    'no-debugger': isProd ? 'error' : 'warn',
    'no-plusplus': 0,
    // 'no-use-before-define': 0,
    // 'prefer-template': 2,
    // 'prettier/prettier': 'error',
    // 'require-yield': 0,
    'no-await-in-loop': 0,
    // 'no-shadow': 0,
    // 'no-unused-vars': 0,
    '@typescript-eslint/indent': 0,
    // '@typescript-eslint/explicit-module-boundary-types': 0,
    // '@typescript-eslint/explicit-member-accessibility': 0,
    // '@typescript-eslint/member-delimiter-style': 0,
    // '@typescript-eslint/no-explicit-any': 0,
    // '@typescript-eslint/no-var-requires': 0,
    // '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-unused-vars': [
      isProd ? 2 : 1,
      { ignoreRestSiblings: true },
    ],
    // '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    // '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
  },
  overrides: [
    {
      files: ['src/entity/*.ts'],
      rules: {
        'import/no-cycle': 0,
      },
    },
  ],
};
