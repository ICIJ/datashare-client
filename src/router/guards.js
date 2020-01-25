import get from 'lodash/get'
import { EventBus } from '@/utils/event-bus'

export default ({ router, auth, store }) => {
  router.beforeEach(async (to, from, next) => {
    // Read the current index from the params
    if (to.params.index && store.state.search.index !== to.params.index) {
      store.commit('search/index', to.params.index)
    }
    // True if the authentication must be skipped
    const skipsAuth = to.matched.some(r => get(r, 'meta.skipsAuth', false))
    try {
      if (skipsAuth || await auth.getUsername() !== null) {
        next()
      } else {
        next('/login')
      }
    } catch (e) {
      console.log(e)
    }
  })

  EventBus.$on('http::error', err => {
    if (err && err.status === 401) {
      router.push('/login')
    }
  })
}
