import { library as fortawesome } from '@fortawesome/fontawesome-svg-core'

import '@/main.scss'
import '@/utils/shared'
import { createCore } from '@/core'
import * as icons from '@/utils/font-awesome'

// Register exported icons
fortawesome.add(...Object.values(icons))

if (import.meta.env.MODE !== 'test' && window) {
  const datashare = createCore()
  // Mount the core when it's ready
  datashare.ready
    // Everything is fine
    .then(() => datashare.useRouter().mount())
    // Redirect to the error page
    .catch((error) => {
      const vm = datashare.useRouter().mount()
      // Unauthenticated error during initialization:
      // redirect the user to the login page
      if (error?.response?.status === 401) {
        vm.$router.push('login')
      } else {
        vm.$router.push({ name: 'error', state: { error } })
      }
    })
  // Register the core globally (so plugins can use it)
  window.datashare = datashare
}
