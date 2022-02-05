module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": ['./tsconfig.json'],
    },
    "plugins": [
        "@typescript-eslint"
    ],
    'rules': {
        'no-undef': 'error',
        'max-len': ['error', { code: 120, 'ignoreUrls': true, }],
        'no-fallthrough': 'error',
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'comma-dangle': ['error', {
            'arrays': 'always-multiline',
            'objects': 'always-multiline',
            'imports': 'always-multiline',
            'exports': 'always-multiline',
            'functions': 'never',
        }],
        'object-curly-spacing': ['error', 'always'],
        'arrow-parens': ['error', 'as-needed'],
        'linebreak-style': 0,
        'keyword-spacing': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'prefer-destructuring': ['error', { 
            array: false, 
            object: true 
        }],
        '@typescript-eslint/no-explicit-any': 'error',
        'eqeqeq': ['error', 'always'],
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/ban-types': 'warn',
        '@typescript-eslint/no-unsafe-return':'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/unbound-method': 'warn',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error'
    },
}
