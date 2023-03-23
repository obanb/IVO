module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
        'plugin:prettier/recommended',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2018,
        ecmaFeatures: {
            project: './tsconfig.json',
        },
    },
    plugins: ['@typescript-eslint', 'prettier', 'import', 'unused-imports'],
    rules: {
        'no-console': 'error',

        '@typescript-eslint/ban-types': 'warn',
        '@typescript-eslint/restrict-plus-operands': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/naming-convention': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'warn',
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/unbound-method': 'warn',
        '@typescript-eslint/await-thenable': 'warn',
        '@typescript-eslint/prefer-includes': 'warn',
        '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',

        // by default error
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-namespace': 'off',

        // by default warn
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-empty-pattern': 'off',

        'prettier/prettier': ['error', require('./.prettierrc.json')],

        'import/no-extraneous-dependencies': 'error',
        // 'import/no-cycle': 'error',

        // import-sort
        'unused-imports/no-unused-imports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',

        'root-library-imports': [
            'error',
            [
                '@eon.cz/gemini11-common',
                '@eon.cz/gemini11-database',
                '@eon.cz/gemini11-graphql',
                '@eon.cz/gemini11-graphql-openapi',
                '@eon.cz/gemini11-logger',
                '@eon.cz/gemini11-sap-adapter',
                '@eon.cz/gemini11-tools',
            ],
        ],
    },
};
