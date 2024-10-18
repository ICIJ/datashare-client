export const routes = [
  {
    path: '/',
    component: () => import('@/views/App'),
    children: [
      {
        name: 'landing',
        path: '',
        component: () => import('@/views/Landing'),
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
          title: 'search.title',
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
          default: () => import('@/views/Search/Search'),
          filters: () => import('@/views/Search/SearchFilters'),
          settings: () => import('@/views/Search/SearchSettings')
        },
        children: [
          {
            name: 'document',
            path: 'd/:index/:id/:routing?',
            alias: 'e/:index/:id/:routing?',
            component: () => import('@/views/DocumentView'),
            props: true,
            meta: {
              title: 'document.title',
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
        component: () => import('@/views/Tasks'),
        redirect: {
          name: 'task.batch-search.list'
        },
        meta: {
          title: 'tasks.title'
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
            component: () => import('@/views/TaskAnalysis'),
            meta: {
              title: 'indexing.title',
              allowedModes: ['LOCAL', 'EMBEDDED']
            },
            children: [
              {
                name: 'task.analysis.new',
                path: 'new',
                component: () => import('@/views/Task/Analysis/TaskAnalysisNew'),
                meta: {
                  title: 'task.analysis.new'
                }
              },
              {
                name: 'task.analysis.list',
                path: '',
                component: () => import('@/views/TaskAnalysisList'),
                meta: {
                  title: 'indexing.title',
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
            component: () => import('@/views/TaskBatchDownload'),
            children: [
              {
                name: 'task.batch-download.list',
                path: '',
                component: () => import('@/views/TaskBatchDownloadList'),
                meta: {
                  title: 'batchDownload.title',
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
              default: () => import('@/views/TaskBatchSearch')
            },
            children: [
              {
                path: '',
                name: 'task.batch-search.list',
                components: {
                  default: () => import('@/views/TaskBatchSearchList')
                },
                meta: {
                  title: 'batchSearch.title',
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
                  default: () => import('@/views/TaskBatchSearchNew')
                },
                meta: {
                  title: 'newBatchSearch.title',
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
                  default: () => import('@/views/TaskBatchSearchView')
                },
                props: true,
                children: [
                  {
                    name: 'task.batch-search.view.results',
                    path: '',
                    props: true,
                    component: () => import('@/views/TaskBatchSearchViewResults')
                  }
                ],
                meta: {
                  title: 'batchSearchResults.title'
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
          default: () => import('@/views/Project/Project'),
          settings: () => import('@/views/Project/ProjectList/ProjectListSettings')
        },
        children: [
          {
            path: '',
            name: 'project.list',
            components: {
              default: () => import('@/views/Project/ProjectList/ProjectList')
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
              default: () => import('@/views/Project/ProjectNew')
            },
            meta: {
              icon: 'plus',
              title: 'Create project',
              allowedModes: ['LOCAL', 'EMBEDDED']
            }
          },
          {
            name: 'project.view',
            path: ':name',
            props: true,
            component: () => import('@/views/Project/ProjectView/ProjectView'),
            meta: {
              icon: null,
              title({ route, core }) {
                return core?.findProject(route.params.name).label
              }
            },
            children: [
              {
                name: 'project.view.overview',
                path: '',
                props: true,
                component: () => import('@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverview'),
                meta: {
                  breadcrumb: false
                },
                children: [
                  {
                    name: 'project.view.overview.insights',
                    path: '',
                    props: true,
                    component: () =>
                      import('@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverviewInsights'),
                    meta: {
                      icon: 'chart-bar',
                      title() {
                        return 'Insights'
                      }
                    }
                  },
                  {
                    name: 'project.view.overview.paths',
                    path: '',
                    props: true,
                    component: () => import('@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverviewPaths'),
                    meta: {
                      icon: 'tree-structure',
                      title() {
                        return 'Paths'
                      }
                    }
                  },
                  {
                    name: 'project.view.overview.graph',
                    path: '',
                    props: true,
                    component: () => import('@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverviewGraph'),
                    meta: {
                      icon: 'polygon',
                      title() {
                        return 'Graph'
                      }
                    }
                  },
                  {
                    name: 'project.view.overview.details',
                    path: '',
                    props: true,
                    component: () =>
                      import('@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverviewDetails'),
                    meta: {
                      icon: 'info',
                      title() {
                        return 'Details'
                      }
                    }
                  },
                  {
                    name: 'project.view.overview.history',
                    path: '',
                    props: true,
                    component: () =>
                      import('@/views/Project/ProjectView/ProjectViewOverview/ProjectViewOverviewHistory'),
                    meta: {
                      icon: 'clock-counter-clockwise',
                      title() {
                        return 'History'
                      }
                    }
                  }
                ]
              },
              {
                name: 'project.view.edit',
                path: 'edit',
                props: true,
                component: () => import('@/views/Project/ProjectView/ProjectViewEdit'),
                meta: {
                  icon: 'pencil-simple',
                  title: 'Edit project',
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
              }
            ]
          }
        ]
      },
      {
        name: 'user-history',
        path: 'user-history',
        component: () => import('@/views/UserHistory'),
        redirect: {
          name: 'user-history.document.list'
        },
        meta: {
          title: 'userHistory.heading'
        },
        children: [
          {
            name: 'user-history.document.list',
            path: 'document',
            component: () => import('@/views/UserHistoryDocumentList'),
            meta: {
              title: 'userHistory.heading'
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
            component: () => import('@/views/UserHistorySavedSearchList'),
            meta: {
              title: 'userHistory.heading'
            }
          }
        ]
      },
      {
        name: 'settings',
        path: '/settings',
        meta: {
          title: 'settings.title'
        },
        component: () => import('@/views/Settings/SettingsView/SettingsView'),
        children: [
          {
            path: '',
            redirect: '/settings/general'
          },
          {
            name: 'settings.general',
            path: 'general',
            component: () => import('@/views/Settings/SettingsView/SettingsViewGeneral'),
            meta: {
              title: 'settings.general.title',
              breadcrumb: false
            }
          },
          {
            name: 'settings.appearance',
            path: 'appearance',
            component: () => import('@/views/Settings/SettingsView/SettingsViewAppearance'),
            meta: {
              title: 'settings.appearance.title',
              breadcrumb: false
            }
          },
          {
            name: 'settings.languages',
            path: 'languages',
            component: () => import('@/views/Settings/SettingsView/SettingsViewLanguages'),
            meta: {
              title: 'settings.languages.title',
              breadcrumb: false
            }
          },
          {
            name: 'settings.plugins',
            path: 'plugins',
            component: () => import('@/views/Settings/SettingsView/SettingsViewAddons'),
            props: { addonsType: 'plugins' },
            meta: {
              title: 'settings.addons.extensions.title',
              breadcrumb: false
            }
          },
          {
            name: 'settings.extensions',
            path: 'extensions',
            component: () => import('@/views/Settings/SettingsView/SettingsViewAddons'),
            props: { addonsType: 'extensions' },
            meta: {
              title: 'settings.addons.plugins.title',
              breadcrumb: false
            }
          }
        ]
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
        component: () => import('@/views/DocumentStandalone')
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
    component: () => import('@/views/DocumentModal')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login'),
    meta: {
      skipsAuth: true,
      title: 'Login'
    }
  },
  {
    name: 'error',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error'),
    props: true,
    meta: {
      skipsAuth: true,
      title: 'Something went wrong'
    }
  }
]

export default { routes }
