import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|React' 
      }],
      'no-console': ['warn', { 
        allow: ['warn', 'error'] 
      }],
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': 'warn',
      'curly': ['warn', 'multi-line'],
      'no-empty': ['error', { 'allowEmptyCatch': true }],
      'no-useless-escape': 'warn'
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.min.js',
      'public/',
      'assets/',
      'scripts/'
    ]
  }
];