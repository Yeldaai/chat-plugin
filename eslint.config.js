const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'require-await': 'error',
      // Keep the ESLint 5 behaviour: these rules were added to (or tightened in) eslint:recommended after v5
      // and flag existing code in src/, fixing it would change the shipped bundle
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'no-prototype-builtins': 'off',
      'no-async-promise-executor': 'off'
    }
  }
]
