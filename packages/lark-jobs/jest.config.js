module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@s18i/lark$': '<rootDir>/../lark/src/index.ts',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
}
