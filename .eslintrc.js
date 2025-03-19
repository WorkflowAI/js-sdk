module.exports = {
  env: { browser: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:require-extensions/recommended',
    'plugin:storybook/recommended',
  ],
  ignorePatterns: ['**/node_modules/**', '**/dist/**'],
  // parser: '@typescript-eslint/parser', Since configs and plugins are installed in sub folders, this needs to be defined locally in package.json
  plugins: [
    '@typescript-eslint',
    'import',
    'unused-imports',
    'require-extensions',
  ],
  rules: {
    'import/order': 0, // turn off in favor of eslint-plugin-simple-import-sort
    'import/no-unresolved': 0,
    'import/no-duplicates': 1,

    'sort-imports': 0, // we use eslint-plugin-import instead

    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            // Prevent importing from the src directory
            // THis is to avoid importing directly accross packages
            // Also avoid loading libraries that are not available in the browser
            group: ['**/src/*', 'node:*', 'fs', 'crypto'],
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['bin/*', 'configs/*'],
      rules: {
        'no-console': 'off',
        'no-restricted-imports': 'off',
      },
    },
  ],
};
