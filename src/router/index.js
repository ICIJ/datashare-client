import Vue from 'vue'
import VueRouter from 'vue-router'

import App from '@/components/App'
import DocumentView from '@/components/document/DocumentView'
import Indexing from '@/components/Indexing'
import Landing from '@/components/Landing'
import Login from '@/components/Login'
import Search from '@/components/Search'

import store from '@/store'
import { isAuthenticated } from '@/utils/utils'
import get from 'lodash/get'

import { EventBus } from '@/utils/event-bus'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: App,
      children: [
        {
          name: 'landing',
          path: '',
          component: Landing
        },
        {
          name: 'search',
          path: '',
          component: Search,
          beforeEnter: (to, from, next) => {
            // This allow to restore the search's state from localStorage
            // even if we are loading this route from a children (where no
            // query paramters are given).
            if (to.name === 'search') {
              store.dispatch('search/updateFromRouteQuery', to.query)
            }
            next()
          },
          children: [
            {
              name: 'document',
              path: 'd/:index/:id/:routing?',
              component: DocumentView,
              props: true
            }
          ]
        },
        {
          name: 'indexing',
          path: 'indexing',
          component: Indexing
        }
      ]
    },
    {
      path: '/login',
      component: Login,
      meta: {
        skipsAuth: true
      }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (to.name === 'document') {
      return { x: 0, y: 0 }
    } else {
      return savedPosition
    }
  }
})

router.beforeEach((to, from, next) => {
  // Read the current index from the params
  if (to.params.index && store.state.search.index !== to.params.index) {
    store.commit('search/index', to.params.index)
  }
  // True if the authentication must be skipped
  const skipsAuth = to.matched.some(r => get(r, 'meta.skipsAuth', false))
  if (skipsAuth || isAuthenticated()) {
    next()
  } else {
    next('/login')
  }
})

EventBus.$on('http::error', err => {
  if (err && err.status === 401) {
    window.location.assign(process.env.VUE_APP_DS_AUTH_SIGNIN)
  }
})

export default router
