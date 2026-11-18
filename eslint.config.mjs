import js from '@eslint/js';
import globals from 'globals';

// Core ESLint tidak menganggap nama komponen JSX sebagai pemakaian variabel.
// Tandai identifier komponen JSX agar import React/component tidak salah ditandai unused.
const jsxUsesVars = {
  rules: {
    'jsx-no-undef': {
      meta: {
        type: 'problem',
        schema: [],
        messages: { tidak: "Komponen JSX '{{nama}}' belum didefinisikan atau belum diimpor." },
        docs: { description: 'Laporkan komponen JSX berawalan huruf kapital yang tidak ada di scope (no-undef bawaan tidak memeriksanya)' },
      },
      create(context) {
        const sumber = context.sourceCode ?? context.getSourceCode();
        const ada = (nama, node) => {
          for (let lingkup = sumber.getScope(node); lingkup; lingkup = lingkup.upper) {
            if (lingkup.set.has(nama)) return true;
          }
          return false;
        };
        return {
          JSXOpeningElement(node) {
            let id = node.name;
            while (id.type === 'JSXMemberExpression') id = id.object;
            if (id.type !== 'JSXIdentifier' || !/^[A-Z]/.test(id.name)) return;
            if (!ada(id.name, node)) context.report({ node: id, messageId: 'tidak', data: { nama: id.name } });
          },
        };
      },
    },
    'uses-vars': {
      meta: { type: 'problem', schema: [], docs: { description: 'Treat JSX component identifiers as variable references' } },
      create(context) {
        return {
          JSXOpeningElement(node) {
            const mark = (name) => {
              if (name?.type === 'JSXIdentifier' && /^[A-Z]/.test(name.name)) {
                (context.sourceCode ?? context.getSourceCode()).markVariableAsUsed(name.name, node);
              }
            };
            if (node.name.type === 'JSXIdentifier') {
              mark(node.name);
            } else if (node.name.type === 'JSXMemberExpression') {
              let current = node.name;
              while (current.type === 'JSXMemberExpression') current = current.object;
              mark(current);
            }
          },
        };
      },
    },
  },
};

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', 'backend/uploads/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { local: jsxUsesVars },
    rules: {
      'local/uses-vars': 'error',
      'local/jsx-no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
