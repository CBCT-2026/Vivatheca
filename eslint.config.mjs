import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // next/link's client-side navigation throws under vinext, so its links never navigate. Use plain <a>.
    rules: {
      'no-restricted-imports': ['error', { paths: [{ name: 'next/link', message: 'next/link does not navigate under vinext. Use a plain <a href>.' }] }],
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    '.agents/**',
    '.impeccable/**',
    'next-env.d.ts',
    'public/**/vendor/**',
  ]),
]);

export default eslintConfig;
