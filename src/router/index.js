import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '@/store'
import { isAuthenticated } from '@/utils/utils'
import get from 'lodash/get'

import { EventBus } from '@/utils/event-bus'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: () => import(`@/pages/App.vue`),
      children: [
        {
          name: 'landing',
          path: '',
          component: () => import(`@/pages/Landing.vue`),
          meta: {
            docs: [
              '<%- os %>/add-documents-to-datashare-on-<%- os %>.md?mode=LOCAL',
              'all/analyze-documents.md?mode=LOCAL'
            ]
          },
          beforeEnter: (to, from, next) => {
            if (to.query.index) {
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
            default: () => import('@/pages/Search.vue'),
            sidebar: () => import('@/components/AggregationsPanel.vue')
          },
          children: [
            {
              name: 'document',
              path: 'd/:index/:id/:routing?',
              alias: 'e/:index/:id/:routing?',
              component: () => import(`@/pages/DocumentView.vue`),
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
          component: () => import(`@/pages/Indexing.vue`),
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
            default: () => import('@/pages/BatchSearch.vue'),
            sidebar: () => import('@/components/BatchSearchForm.vue')
          },
          meta: {
            docs: [
              'all/batch-search-documents.md'
            ]
          }
        },
        {
          name: 'batch-search.results',
          path: 'batch-search/:index/:uuid',
          components: {
            default: () => import('@/pages/BatchSearchResults.vue'),
            sidebar: () => import('@/components/BatchSearchResultsFilters')
          },
          props: {
            default: true,
            sidebar: true
          }
        },
        {
          name: 'user-history',
          path: 'user-history',
          component: () => import(`@/pages/UserHistory.vue`)
        },
        {
          name: 'docs',
          path: 'docs/:slug',
          components: {
            default: () => import(`@/pages/RouteDoc.vue`),
            sidebar: () => import(`@/components/RouteDocsLinks.vue`)
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
      component: () => import(`@/pages/DocumentView.vue`)
    },
    {
      path: '/login',
      component: () => import(`@/pages/Login.vue`),
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
    router.push('/login')
  }
})

export default router
