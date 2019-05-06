module.exports = {
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
  testMatch: [
    '**/tests/unit/**/*.spec.js',
    '**/tests/integration/**/*.spec.js'
  ],
  coverageDirectory: 'tests/unit/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(js|vue)'
  ],
  testURL: 'http://localhost:9090/',
  setupFiles: [
    'jest-canvas-mock'
  ],
  preset: 'jest-puppeteer',
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testEnvironment: './puppeteer_environment.js'
}
