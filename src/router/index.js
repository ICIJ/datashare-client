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
              {
                title: 'Add documents to Datashare',
                path: '<%- os %>/add-documents-to-datashare-on-<%- os %>',
                mode: ['LOCAL', 'EMBEDDED']
              },
              {
                title: 'Analyse documents',
                path: 'all/analyze-documents'
              }
            ]
          },
          beforeEnter: (to, from, next) => {
            if (to.query.index || to.query.indices) {
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
              {
                title: 'Search documents',
                path: 'all/search-documents'
              },
              {
                title: 'Filter a documents',
                path: 'all/filter-documents'
              },
              {
                title: 'Search with pperators',
                path: 'all/search-with-operators'
              },
              {
                title: 'Star a document',
                path: 'all/star-documents'
              }
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
                  {
                    title: 'Star a document',
                    path: 'all/star-documents'
                  },
                  {
                    title: 'Tag a document',
                    path: 'all/tag-documents'
                  },
                  {
                    title: 'Use keyboard shortcuts',
                    path: 'all/use-keyboard-shortcuts'
                  }
                ]
              }
            }
          ]
        },
        {
          path: 'batch-search',
          redirect: {
            name: 'task.batch-search.list'
          }
        },
        {
          path: 'indexing',
          redirect: {
            name: 'indexing'
          }
        },
        {
          path: 'batch-search/:index/:uuid',
          redirect: {
            name: 'task.batch-search.view.results'
          }
        },
        {
          name: 'tasks',
          path: 'tasks',
          component: () => import('@/pages/Tasks'),
          redirect: {
            name: 'task.batch-search.list'
          },
          meta: {
            title: ({ i18n }) => i18n.t('tasks.title')
          },
          children: [
            {
              name: 'indexing',
              path: 'indexing',
              component: () => import('@/pages/Indexing'),
              meta: {
                title: ({ i18n }) => i18n.t('indexing.title'),
                allowedModes: ['LOCAL', 'EMBEDDED'],
                docs: [
                  {
                    title: 'Add documents to Datashare',
                    path: '<%- os %>/add-documents-to-datashare-on-<%- os %>'
                  },
                  {
                    title: 'Analyse documents',
                    path: 'all/analyze-documents'
                  }
                ]
              }
            },
            {
              name: 'batch-download',
              path: 'batch-download',
              component: () => import('@/pages/BatchDownload'),
              meta: {
                title: ({ i18n }) => i18n.t('batchDownload.title'),
                docs: [
                  {
                    title: 'Add documents to Datashare',
                    path: '<%- os %>/add-documents-to-datashare-on-<%- os %>',
                    mode: ['LOCAL', 'EMBEDDED']
                  },
                  {
                    title: 'Analyse documents',
                    path: 'all/analyze-documents'
                  }
                ]
              }
            },
            {
              name: 'task.batch-search',
              path: 'batch-search',
              components: {
                default: () => import('@/pages/TaskBatchSearch')
              },
              children: [
                {
                  path: '',
                  name: 'task.batch-search.list',
                  components: {
                    default: () => import('@/pages/TaskBatchSearchList')
                  },
                  meta: {
                    title: ({ i18n }) => i18n.t('batchSearch.title'),
                    docs: [
                      {
                        title: 'How to use batch searches',
                        path: 'all/batch-search-documents'
                      }
                    ]
                  }
                },
                {
                  name: 'task.batch-search.new',
                  path: 'new',
                  components: {
                    default: () => import('@/pages/TaskBatchSearchNew')
                  },
                  meta: {
                    title: ({ i18n }) => i18n.t('newBatchSearch.title'),
                    docs: [
                      {
                        title: 'How to use batch searches',
                        path: 'all/batch-search-documents'
                      }
                    ]
                  }
                },
                {
                  name: 'task.batch-search.view',
                  path: ':index/:uuid',
                  components: {
                    default: () => import('@/pages/TaskBatchSearchView')
                  },
                  props: true,
                  children: [
                    {
                      name: 'task.batch-search.view.results',
                      path: '',
                      props: true,
                      component: () => import('@/pages/TaskBatchSearchViewResults')
                    }
                  ],
                  meta: {
                    title: ({ i18n }) => i18n.t('batchSearchResults.title')
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'project',
          components: {
            default: () => import('@/pages/Project')
          },
          children: [
            {
              path: '',
              name: 'project.list',
              components: {
                default: () => import('@/pages/ProjectList')
              }
            },
            {
              name: 'project.new',
              path: 'new',
              components: {
                default: () => import('@/pages/ProjectNew')
              },
              meta: {
                allowedModes: ['LOCAL', 'EMBEDDED']
              }
            },
            {
              name: 'project.view',
              path: ':name',
              props: true,
              component: () => import('@/pages/ProjectView'),
              children: [
                {
                  name: 'project.view.insights',
                  path: '',
                  props: true,
                  component: () => import('@/pages/ProjectViewInsights')
                }
              ]
            }
          ]
        },
        {
          name: 'user-history',
          path: 'user-history',
          component: () => import('@/pages/UserHistory'),
          redirect: {
            name: 'document-history'
          },
          meta: {
            title: ({ i18n }) => i18n.t('userHistory.heading')
          },
          children: [
            {
              name: 'document-history',
              path: 'document',
              component: () => import('@/pages/UserHistoryDocument'),
              meta: {
                title: ({ i18n }) => i18n.t('userHistory.heading')
              }
            },
            {
              name: 'search-history',
              path: 'search',
              component: () => import('@/pages/UserHistorySearch'),
              meta: {
                title: ({ i18n }) => i18n.t('userHistory.heading')
              }
            }
          ]
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
          name: 'document-standalone',
          path: '/ds/:index/:id/:routing?',
          meta: {
            title: 'Document'
          },
          props(route) {
            return { ...route.params, ...route.query }
          },
          component: () => import('@/pages/DocumentStandalone')
        }
      ]
    },
    {
      name: 'document-modal',
      path: '/dm/:index/:id/:routing',
      meta: {
        title: 'Document'
      },
      props(route) {
        return { ...route.params, ...route.query }
      },
      component: () => import('@/pages/DocumentModal')
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
