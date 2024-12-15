module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:i18next/recommended'
  ],
  plugins: ['import'],
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Disable the import/no-named-as-default rule
    'import/no-named-as-default': 'off',

    // Import order configuration
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          { pattern: '@renderer/**', group: 'internal' },
          { pattern: '@shared/**', group: 'internal' },
          { pattern: '@main/**', group: 'internal' }
        ],
        pathGroupsExcludedImportTypes: ['builtin', 'external'],
        'newlines-between': 'always'
      }
    ],

    // Prettier
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ]
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.web.json', './tsconfig.node.json']
      }
    },
    react: {
      version: 'detect'
    }
  }
}
