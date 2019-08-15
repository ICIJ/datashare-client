import Vue from 'vue'
import VueRouter from 'vue-router'

import AggregationsPanel from '@/components/AggregationsPanel'
import BatchSearchForm from '@/components/BatchSearchForm'
import BatchSearchResultsFilters from '@/components/BatchSearchResultsFilters'
import RouteDocsLinks from '@/components/RouteDocsLinks'

import App from '@/pages/App'
import BatchSearch from '@/pages/BatchSearch'
import BatchSearchResults from '@/pages/BatchSearchResults'
import DocumentView from '@/pages/DocumentView'
import Indexing from '@/pages/Indexing'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import RouteDoc from '@/pages/RouteDoc'
import Search from '@/pages/Search'
import UserHistory from '@/pages/UserHistory'

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
          component: Landing,
          meta: {
            docs: [
              '<%- os %>/add-documents-to-datashare-on-<%- os %>.md?mode=LOCAL',
              'all/analyze-documents.md?mode=LOCAL'
            ]
          },
          beforeEnter: (to, from, next) => {
            // This allow to restore the search's state from localStorage
            // even if we are loading this route from a children (where no
            // query parameters are given).
            if (to.query.q) {
              next({ name: 'search', query: to.query })
            }
            next()
          }
        },
        {
          name: 'search',
          path: '',
          meta: {
            docs: [
              'all/search-documents.md',
              'all/filter-documents.md',
              'all/search-with-operators.md',
              'all/star-documents.md'
            ]
          },
          components: {
            default: Search,
            sidebar: AggregationsPanel
          },
          beforeEnter: (to, from, next) => {
            // This allow to restore the search's state from localStorage
            // even if we are loading this route from a children (where no
            // query parameters are given).
            if (to.name === 'search') {
              store.dispatch('search/updateFromRouteQuery', to.query)
            }
            next()
          },
          children: [
            {
              name: 'document',
              path: 'd/:index/:id/:routing?',
              alias: 'e/:index/:id/:routing?',
              component: DocumentView,
              props: true,
              meta: {
                docs: [
                  'all/star-documents.md',
                  'all/tag-documents.md',
                  'all/use-keyboard-shortcuts.md'
                ]
              }
            }
          ]
        },
        {
          name: 'indexing',
          path: 'indexing',
          component: Indexing,
          meta: {
            docs: [
              '<%- os %>/add-documents-to-datashare-on-<%- os %>.md?mode=LOCAL',
              'all/analyze-documents.md?mode=LOCAL'
            ]
          }
        },
        {
          name: 'batch-search',
          path: 'batch-search',
          components: {
            default: BatchSearch,
            sidebar: BatchSearchForm
          }
        },
        {
          name: 'batch-search.results',
          path: 'batch-search/:index/:uuid',
          components: {
            default: BatchSearchResults,
            sidebar: BatchSearchResultsFilters
          },
          props: {
            default: true,
            sidebar: true
          }
        },
        {
          name: 'user-history',
          path: 'user-history',
          component: UserHistory
        },
        {
          name: 'docs',
          path: 'docs/:slug',
          components: {
            default: RouteDoc,
            sidebar: RouteDocsLinks
          },
          props: {
            default: true,
            sidebar: true
          }
        }
      ]
    },
    {
      name: 'document-simplified',
      path: '/ds/:index/:id/:routing?',
      component: DocumentView
    },
    {
      path: '/login',
      component: Login,
      meta: {
        skipsAuth: true
      }
    }
  ]
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
