import Core from './Core'

import { apiInstance } from '@/api/apiInstance'
export { default as Core } from './Core'

export function createCore(api = apiInstance) {
  const core = Core.init(api)
  // Configure the core with server conf.
  // No need for async since the promise is resolved in by another function reference (see ready)
  core.configure()
  // Create the core with all available plugins
  core.useAll()
  // Returns both the core
  return core
}
