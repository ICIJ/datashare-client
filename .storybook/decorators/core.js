import CoreSetup from '../../tests/unit/CoreSetup'

// Build the Storybook core exactly once and reuse it across stories.
let core = null

export function getStorybookCore() {
  if (core) {
    return core
  }
  core = CoreSetup.init().useAll().useRouterWithoutGuards()
  // Seed the minimal config prop-driven components read. We intentionally do
  // NOT call `configure()` (no backend round-trip on boot). `previewHost: null`
  // replaces the per-story `withMurmur({ previewHost: null })` decorators.
  core.config.merge({
    mode: 'LOCAL',
    projects: [{ name: 'local-datashare', label: 'Local Datashare' }],
    defaultProject: 'local-datashare',
    dataDir: '/home/datashare/data',
    previewHost: null,
    batchDownloadMaxNbFiles: 10000,
    batchDownloadMaxSize: '100G'
  })
  if (typeof window !== 'undefined') {
    window.datashare = core
  }
  return core
}

// Install the core's Vue plugins onto Storybook's preview app, mirroring how
// unit tests pass `core.plugins` to `mount(..., { global: { plugins } })`.
export function installCore(app) {
  const built = getStorybookCore()
  for (const plugin of built.plugins) {
    if (Array.isArray(plugin)) {
      app.use(...plugin)
    } else {
      app.use(plugin)
    }
  }
}
