import '@/main.scss'
import '@/utils/shared'
import { createCore } from '@/core'
import { handleBootFailure } from '@/core/handleBootFailure'

if (import.meta.env.MODE !== 'test' && window) {
  const datashare = createCore()
  // Mount the core when it's ready
  datashare.ready
    // Everything is fine
    .then(() => datashare.useRouter().mount())
    // Store the requested URL (on 401) and redirect to login or error
    .catch(error => handleBootFailure(datashare, error))
  // Register the core globally (so plugins can use it)
  window.datashare = datashare
}
