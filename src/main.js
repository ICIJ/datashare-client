import { createCore } from '@/core'

import '@/utils/font-awesome'
import '@/main.scss'

if (process.env.NODE_ENV !== 'test' && window) {
  const core = createCore()
  // Mount the core when it's ready
  core.ready.then(() => core.mount())
  // Register the core globally (so plugins can use it)
  window.core = core
}
