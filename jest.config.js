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
    'tests/(.*)$': '<rootDir>/tests/$1',
    '!!file-loader!pdfjs-dist/build/(.*)$': '<rootDir>/node_modules/pdfjs-dist/es5/build/$1'
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
