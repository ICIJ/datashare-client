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
            title: ({ i18n }) => i18n.t('search.title'),
            docs: [
              'all/search-documents.md',
              'all/filter-documents.md',
              'all/search-with-operators.md',
              'all/star-documents.md'
            ]
          },
          components: {
            default: () => import('@/pages/Search'),
            sidebar: () => import('@/components/FiltersPanel')
          },
          children: [
            {
              name: 'document',
              path: 'd/:index/:id/:routing?',
              alias: 'e/:index/:id/:routing?',
              component: () => import('@/pages/DocumentView'),
              props: true,
              meta: {
                title: ({ i18n }) => i18n.t('document.title'),
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
          component: () => import('@/pages/Indexing'),
          meta: {
            title: ({ i18n }) => i18n.t('indexing.title'),
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
            default: () => import('@/pages/BatchSearch')
          },
          meta: {
            title: ({ i18n }) => i18n.t('batchSearch.title'),
            docs: [
              'all/batch-search-documents.md'
            ]
          }
        },
        {
          name: 'batch-search.results',
          path: 'batch-search/:index/:uuid',
          components: {
            default: () => import('@/pages/BatchSearchResults')
          },
          props: {
            default: true,
            sidebar: true
          },
          meta: {
            title: ({ i18n }) => i18n.t('batchSearchResults.title')
          }
        },
        {
          name: 'user-history',
          path: 'user-history',
          component: () => import('@/pages/UserHistory'),
          meta: {
            title: ({ i18n }) => i18n.t('userHistory.heading')
          }
        },
        {
          name: 'docs',
          path: 'docs/:slug',
          components: {
            default: () => import('@/pages/RouteDoc'),
            sidebar: () => import('@/components/RouteDocsLinks')
          },
          meta: {
            title: ({ i18n }) => i18n.t('document.title')
          },
          props: {
            default: true,
            sidebar: true
          }
        },
        {
          name: 'settings',
          path: '/settings',
          meta: {
            title: ({ i18n }) => i18n.t('server.title')
          },
          component: () => import('@/pages/Settings')
        },
        {
          name: 'insights',
          path: '/insights',
          meta: {
            title: ({ i18n }) => i18n.t('insights.title')
          },
          component: () => import('@/pages/Insights')
        }
      ]
    },
    {
      name: 'document-simplified',
      path: '/ds/:index/:id/:routing?',
      meta: {
        title: 'Document'
      },
      component: () => import('@/pages/DocumentView')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login'),
      meta: {
        skipsAuth: true,
        title: 'Login'
      }
    },
    {
      name: 'error',
      path: '*',
      component: () => import('@/pages/Error'),
      props: true,
      meta: {
        skipsAuth: true,
        title: 'Something went wrong'
      }
    }
  ]
}

export default router
