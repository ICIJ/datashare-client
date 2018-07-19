import Vue from 'vue'
import VueRouter from 'vue-router'

import App from '@/components/App'
import DocumentView from '@/components/document/DocumentView'
import Landing from '@/components/Landing'
import Indexing from '@/components/Indexing'
import Search from '@/components/Search'
import About from '@/components/About'

import store from '@/store'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      component: App,
      children: [
        {
          name: 'search',
          path: '',
          component: Search,
          beforeEnter: (to, from, next) => {
            // Not a child route and Query is empty
            if (to.name === 'search' && [null, undefined, ''].indexOf(to.query.q) > -1) {
              // Redirect to landing page
              return next({ name: 'landing' })
            }
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
              path: 'd/:id/:routing?',
              component: DocumentView,
              props: true
            }
          ]
        },
        {
          name: 'landing',
          path: '',
          component: Landing
        },
        {
          name: 'indexing',
          path: 'indexing',
          component: Indexing
        },
        {
          name: 'about',
          path: 'about',
          component: About
        }
      ]
    }
  ]
})
