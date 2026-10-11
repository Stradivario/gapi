module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['lcov', 'html'],
  rootDir: './',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  // Mirrors tsconfig `paths`.
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@introspection/(.*)$': '<rootDir>/src/@introspection/$1',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1',
  },
  globals: {
    __DEV__: true,
  },
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '/test/.*\\.spec.(ts|tsx|js)$',
  verbose: true,
  collectCoverage: true,
};
