export const router = {
  routes: [
    {
      path: '/',
      component: () => import('@/pages/App'),
      children: [
        {
          name: 'landing',
          path: '',
          component: () => import('@/pages/Landing'),
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
            default: () => import('@/pages/Search'),
            sidebar: () => import('@/components/AggregationsPanel')
          },
          children: [
            {
              name: 'document',
              path: 'd/:index/:id/:routing?',
              alias: 'e/:index/:id/:routing?',
              component: () => import(`@/pages/DocumentView`),
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
          component: () => import(`@/pages/Indexing`),
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
            default: () => import('@/pages/BatchSearch'),
            sidebar: () => import('@/components/BatchSearchForm')
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
            default: () => import('@/pages/BatchSearchResults'),
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
          component: () => import(`@/pages/UserHistory`)
        },
        {
          name: 'docs',
          path: 'docs/:slug',
          components: {
            default: () => import(`@/pages/RouteDoc`),
            sidebar: () => import(`@/components/RouteDocsLinks`)
          },
          props: {
            default: true,
            sidebar: true
          }
        },
        {
          path: '/config',
          component: () => import(`@/pages/Config`)
        }
      ]
    },
    {
      name: 'document-simplified',
      path: '/ds/:index/:id/:routing?',
      component: () => import(`@/pages/DocumentView`)
    },
    {
      path: '/login',
      component: () => import(`@/pages/Login`),
      meta: {
        skipsAuth: true
      }
    }
  ]
}

export default router
