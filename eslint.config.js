import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      '.wrangler',
      'coverage',
      'playwright-report',
      'test-results',
      'reports',
      'docs/02-ux/prototipo',
      'src/worker/worker-configuration.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Seguridad (AME-08): nunca HTML sin escapar.
      'no-restricted-syntax': [
        'error',
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'Prohibido: riesgo de XSS (ADR-0004).' },
        { selector: "MemberExpression[property.name='innerHTML']", message: 'Prohibido: riesgo de XSS (ADR-0004).' },
      ],
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
  {
    // Las fixtures de Playwright exigen el patrón `{}`.
    files: ['tests/e2e/**/*.ts'],
    rules: { 'no-empty-pattern': 'off' },
  },
  {
    files: ['src/client/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
);
