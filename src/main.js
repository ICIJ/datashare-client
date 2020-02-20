import { createCore } from '@/core'

import '@/utils/font-awesome'
import '@/main.scss'

if (process.env.NODE_ENV !== 'test' && window) {
  const datashare = createCore()
  // Mount the core when it's ready
  datashare.ready.then(() => datashare.mount())
  // Register the core globally (so plugins can use it)
  window.datashare = datashare
}
