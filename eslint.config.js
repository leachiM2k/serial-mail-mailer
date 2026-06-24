const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');
const globals = require('globals');

module.exports = tseslint.config(
    {
        ignores: ['node_modules/', 'out/', '.webpack/', '.idea/', 'dist/'],
    },
    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.electron,
    importPlugin.flatConfigs.typescript,
    {
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'import/no-unresolved': ['error', { ignore: ['\\.css$'] }],
        },
    },
);
