process.env.VUE_APP_ES_ANOTHER_INDEX = 'another-index'
process.env.VUE_APP_ES_LOG = 'debug'
process.env.VUE_APP_ES_HOST = 'http://elasticsearch:9200'
process.env.VUE_APP_DS_HOST = 'http://localhost:9009'
process.env.VUE_APP_FEATURE_BATCH_DOWNLOAD = true
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
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
  testMatch: ['**/tests/unit/**/*.spec.js'],
  coverageDirectory: '<rootDir>/tests/unit/coverage',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.(js|vue)'
  ],
  testURL: 'http://localhost:9009/',
  testTimeout: 20000,
  setupFiles: [
    'jest-canvas-mock'
  ]
}
