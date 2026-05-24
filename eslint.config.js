import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'CallExpression[callee.name="useState"] > Identifier.arguments',
          message: 'F-SSOT Violation: Do not pass variables directly to useState. This creates derived state. Use useMemo instead.'
        },
        {
          selector: 'CallExpression[callee.name="useState"] > MemberExpression.arguments',
          message: 'F-SSOT Violation: Do not pass object properties directly to useState. This creates derived state.'
        }
      ]
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['*features/*', '*apps/*'],
          message: 'Boundary Violation: shared/ cannot import from features/ or apps/'
        }]
      }]
    }
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['*apps/*'],
          message: 'Boundary Violation: features/ cannot import from apps/'
        }]
      }]
    }
  },
])
