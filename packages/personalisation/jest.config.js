const path = require('path');

process.env.TZ = 'Europe/Prague';

const cfg = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: 'src/__tests?__/.*\\.test\\.ts',
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/lib/'],
    // collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'], // note: Jest will look for, in left-to-right order.
};

module.exports = {
    ...cfg,
};