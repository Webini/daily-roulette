const path = require('path');

module.exports = {
  globalSetup: path.resolve('./jest.setup.js'),
  globals: {
    'ts-jest': {
      tsconfig: path.resolve('./tsconfig.json'),
    },
  },
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
