module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testMatch: [
        '**/__tests__/**/*.(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)'
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{ts,tsx}'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};
