module.exports = {
    root: true,
    extends: [
        '@react-native',
        '@typescript-eslint/recommended',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react-native/no-unused-styles': 'error'
    }
};
