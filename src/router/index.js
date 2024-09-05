export const routes = [
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
          } else {
            next()
          }
        }
      },
      {
        name: 'search',
        path: '',
        meta: {
          title: ({ i18n }) => i18n.global.t('search.title'),
          docs: [
            {
              title: 'Search documents',
              path: 'usage/search-documents'
            },
            {
              title: 'Filter a documents',
              path: 'usage/filter-documents'
            },
            {
              title: 'Search with operators',
              path: 'usage/search-with-operators'
            },
            {
              title: 'Star a document',
              path: 'usage/star-documents'
            }
          ]
        },
        components: {
          default: () => import('@/pages/Search'),
          sidebar: () => import('@/components/FiltersPanel/FiltersPanel')
        },
        children: [
          {
            name: 'document',
            path: 'd/:index/:id/:routing?',
            alias: 'e/:index/:id/:routing?',
            component: () => import('@/pages/DocumentView'),
            props: true,
            meta: {
              title: ({ i18n }) => i18n.global.t('document.title'),
              docs: [
                {
                  title: 'Star a document',
                  path: 'usage/star-documents'
                },
                {
                  title: 'Tag a document',
                  path: 'usage/tag-documents'
                },
                {
                  title: 'Use keyboard shortcuts',
                  path: 'usage/use-keyboard-shortcuts'
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
          title: ({ i18n }) => i18n.global.t('tasks.title')
        },
        children: [
          {
            path: 'indexing',
            redirect: {
              name: 'task.analysis.list'
            }
          },
          {
            name: 'task.analysis',
            path: 'analysis',
            component: () => import('@/pages/TaskAnalysis'),
            meta: {
              title: ({ i18n }) => i18n.global.t('indexing.title'),
              allowedModes: ['LOCAL', 'EMBEDDED']
            },
            children: [
              {
                name: 'task.analysis.list',
                path: '',
                component: () => import('@/pages/TaskAnalysisList'),
                meta: {
                  title: ({ i18n }) => i18n.global.t('indexing.title'),
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
              }
            ]
          },
          {
            name: 'task.batch-download',
            path: 'batch-download',
            component: () => import('@/pages/TaskBatchDownload'),
            children: [
              {
                name: 'task.batch-download.list',
                path: '',
                component: () => import('@/pages/TaskBatchDownloadList'),
                meta: {
                  title: ({ i18n }) => i18n.global.t('batchDownload.title'),
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
              }
            ]
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
                  title: ({ i18n }) => i18n.global.t('batchSearch.title'),
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
                  title: ({ i18n }) => i18n.global.t('newBatchSearch.title'),
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
                path: ':indices/:uuid',
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
                  title: ({ i18n }) => i18n.global.t('batchSearchResults.title')
                }
              }
            ]
          }
        ]
      },
      {
        path: 'project',
        name: 'project',
        meta: {
          icon: 'circles-three-plus',
          title: 'Projects'
        },
        components: {
          default: () => import('@/pages/Project')
        },
        children: [
          {
            path: '',
            name: 'project.list',
            components: {
              default: () => import('@/pages/ProjectList')
            },
            meta: {
              icon: 'dots-nine',
              title: 'All projects'
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
              },
              {
                name: 'project.view.edit',
                path: 'edit',
                props: true,
                component: () => import('@/pages/ProjectViewEdit'),
                meta: {
                  allowedModes: ['LOCAL', 'EMBEDDED']
                }
              },
              {
                name: 'project.view.delete',
                path: 'delete',
                props: true,
                redirect: {
                  name: 'project.view.edit'
                }
              },
              {
                name: 'project.view.add-documents',
                path: 'add-documents',
                components: {
                  default: () => import('@/pages/ProjectViewAddDocuments')
                },
                meta: {
                  allowedModes: ['LOCAL', 'EMBEDDED']
                }
              },
              {
                name: 'project.view.find-named-entities',
                path: 'find-named-entities',
                components: {
                  default: () => import('@/pages/ProjectViewFindNamedEntities')
                },
                meta: {
                  allowedModes: ['LOCAL', 'EMBEDDED']
                }
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
          name: 'user-history.document.list'
        },
        meta: {
          title: ({ i18n }) => i18n.global.t('userHistory.heading')
        },
        children: [
          {
            name: 'user-history.document.list',
            path: 'document',
            component: () => import('@/pages/UserHistoryDocumentList'),
            meta: {
              title: ({ i18n }) => i18n.global.t('userHistory.heading')
            }
          },
          {
            path: 'search',
            redirect: {
              name: 'user-history.saved-search.list'
            }
          },
          {
            name: 'user-history.saved-search.list',
            path: 'saved-search',
            component: () => import('@/pages/UserHistorySavedSearchList'),
            meta: {
              title: ({ i18n }) => i18n.global.t('userHistory.heading')
            }
          }
        ]
      },
      {
        name: 'settings',
        path: '/settings',
        meta: {
          title: ({ i18n }) => i18n.global.t('server.title')
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
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/Error'),
    props: true,
    meta: {
      skipsAuth: true,
      title: 'Something went wrong'
    }
  }
]

export default { routes }
