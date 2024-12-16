export default {
    setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    transform: {
      '^.+\\.[tj]sx?$': 'babel-jest', // Use babel-jest to transform JSX/TSX
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
      '\\.(png|jpg|jpeg|svg|gif|webp|avif)$': '<rootDir>/jest/mocks/fileMock.js', // Mock image imports
    },
    cacheDirectory: '<rootDir>/.jest-cache',
    testMatch: ['**/testing/**/*.test.[jt]s?(x)'], // Match test files

  };
  