import { library as fortawesome } from '@fortawesome/fontawesome-svg-core'

import * as icons from '@/utils/font-awesome'
import { createCore } from '@/core'
import '@/main'

// Register exported icons
fortawesome.add(...Object.values(icons))

if (process.env.NODE_ENV !== 'test' && window) {
  const datashare = createCore()
  // Mount the core when it's ready
  datashare.ready
    // Everything is fine
    .then(() => datashare.mount())
    // Redirect to the error page
    .catch((error) => {
      const vm = datashare.mount()
      // Unauthenticated error during initialization:
      // redirect the user to the login page
      if (error?.response?.status === 401) {
        vm.$router.push('login')
      } else {
        vm.$router.push({ name: 'error', params: { error } })
      }
    })
  // Register the core globally (so plugins can use it)
  window.datashare = datashare
}
