const { defaults } = require('jest-config')

const { TEST_MODE } = process.env

module.exports = {
  setupTestFrameworkScriptFile: '<rootDir>/tests/unit/setup.js',
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(bootstrap-vue)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'tests/(.*)$': '<rootDir>/tests/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: TEST_MODE === 'integration' ? ['**/tests/integration/**/*.spec.js'] : ['**/tests/unit/**/*.spec.js'],
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.(js|vue)'
  ],
  testURL: 'http://localhost:9090/',
  setupFiles: [
    'jest-canvas-mock'
  ],
  preset: TEST_MODE === 'integration' ? 'jest-puppeteer' : defaults.preset,
  globalSetup: TEST_MODE === 'integration' ? './tests/integration/config/setup.js' : null,
  globalTeardown: TEST_MODE === 'integration' ? './tests/integration/config/teardown.js' : null,
  testEnvironment: TEST_MODE === 'integration' ? './tests/integration/config/puppeteer_environment.js' : defaults.testEnvironment
}
