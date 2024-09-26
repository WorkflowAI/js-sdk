module.exports = {
  env: { browser: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:require-extensions/recommended',
    // 'prettier', Since configs and plugins are installed in sub folders, this needs to be defined locally in package.json
  ],
  ignorePatterns: [],
  // parser: '@typescript-eslint/parser', Since configs and plugins are installed in sub folders, this needs to be defined locally in package.json
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'unused-imports',
    'require-extensions',
  ],
  rules: {
    'import/order': 0, // turn off in favor of eslint-plugin-simple-import-sort
    'import/no-unresolved': 0,
    'import/no-duplicates': 1,

    /**
     * eslint-plugin-simple-import-sort @see https://github.com/lydell/eslint-plugin-simple-import-sort
     */
    'sort-imports': 0, // we use eslint-plugin-import instead
    'simple-import-sort/imports': 1,
    'simple-import-sort/exports': 1,

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
  },
}
