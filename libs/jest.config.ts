import type { Config } from 'jest';

// disable extra logging for tests
process.env.STON_CONTRACTS_LOGGER_DISABLED = 'true';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};

export default config;
