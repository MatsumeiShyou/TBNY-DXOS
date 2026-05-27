import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { getEffectiveMode } from './.agent/scripts/lib/force_mode_reader.js'

const getEslintMode = (ruleName) => {
  const mode = getEffectiveMode(ruleName);
  return mode === 'warning' ? 'warn' : mode;
};

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
        getEslintMode('FSOOT'),
        {
          selector: "CallExpression[callee.name='useState'][arguments.0.type='Identifier'][arguments.0.name!='undefined']",
          message: "[F-SSOT] useStateに変数(Identifier)を直接渡して派生状態を作らないでください。useMemoによる純粋導出を使用してください。"
        },
        {
          selector: "CallExpression[callee.name='useState'][arguments.0.type='MemberExpression']",
          message: "[F-SSOT] useStateにpropsやオブジェクトのプロパティ(MemberExpression)を直接渡して派生状態を作らないでください。useMemoによる純粋導出を使用してください。"
        }
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}', 'src/shared/**/*.js'],
    rules: {
      'no-restricted-imports': [
        getEslintMode('BOUNDARY'),
        {
          patterns: [
            {
              group: ['@/features/*', '@/apps/*', '*/features/*', '*/apps/*', '../*features/*', '../*apps/*'],
              message: '[Boundary Enforcement] shared/ 層から features/ や apps/ への依存は禁止されています。'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/features/**/*.js'],
    rules: {
      'no-restricted-imports': [
        getEslintMode('BOUNDARY'),
        {
          patterns: [
            {
              group: ['@/apps/*', '*/apps/*', '../*apps/*'],
              message: '[Boundary Enforcement] features/ 層から apps/ への依存は禁止されています。'
            }
          ]
        }
      ]
    }
  }
])
