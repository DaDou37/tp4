import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{js,jsx}'],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    plugins: {
      'jsx-a11y': jsxA11y,
    },

    rules: {
      ...jsxA11y.configs.recommended.rules,

      // Désactivé car le code du TP utilise useEffect + setState
      'react-hooks/set-state-in-effect': 'off',

      // Le plugin React n'est pas utilisé pour analyser les références JSX
      'no-unused-vars': 'off',
    },

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
])