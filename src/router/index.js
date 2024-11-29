export const routes = [
  {
    path: '/',
    component: () => import('@/views/App'),
    children: [
      {
        name: 'landing',
        path: '',
        redirect: (to) => {
          if (to.query.index || to.query.indices) {
            return { name: 'search', query: to.query }
          }
          return { name: 'project.list' }
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
            component: () => import('@/views/Document/DocumentView/DocumentView'),
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
            },
            children: [
              {
                name: 'document.text',
                path: 'text',
                component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsText')
              },
              {
                name: 'document.viewer',
                path: 'viewer',
                component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer')
              },
              {
                name: 'document.metadata',
                path: 'metadata',
                component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata')
              },
              {
                name: 'document.entities',
                path: 'entities',
                component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities')
              }
            ]
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
        components: {
          default: () => import('@/views/Task/Tasks'),
          settings: () => import('@/views/Task/TasksListSettings')
        },
        meta: {
          title: 'task.title'
        },
        children: [
          {
            path: 'indexing',
            redirect: {
              name: 'task.documents.list'
            }
          },
          {
            path: 'analysis',
            redirect: {
              name: 'task.documents.list'
            }
          },
          {
            name: 'task.entities',
            path: 'entities',
            meta: { title: 'task.entities.title' },
            children: [
              {
                name: 'task.entities.list',
                path: '',
                component: () => import('@/views/Task/Entities/TaskEntitiesList'),
                meta: {
                  breadcrumb: false
                }
              },
              {
                name: 'task.entities.new',
                props: ({ query }) => ({ projectName: query.projectName }),
                path: 'new',
                component: () => import('@/views/Task/Entities/TaskEntitiesNew'),
                meta: {
                  title: 'task.entities.new.title'
                }
              }
            ]
          },
          {
            name: 'task.documents',
            path: 'documents',
            meta: { title: 'task.documents.title' },
            children: [
              {
                name: 'task.documents.list',
                path: '',
                component: () => import('@/views/Task/Documents/TaskDocumentsList'),
                meta: {
                  breadcrumb: false
                }
              },
              {
                name: 'task.documents.new',
                path: 'new',
                component: () => import('@/views/Task/Documents/TaskDocumentsNew'),
                props: ({ query }) => ({ projectName: query.projectName }),
                meta: {
                  title: 'task.documents.new.title'
                }
              }
            ]
          },
          {
            name: 'task.batch-download',
            path: 'batch-download',
            meta: { title: 'task.batch-download.title' },
            children: [
              {
                name: 'task.batch-download.list',
                path: '',
                component: () => import('@/views/Task/BatchDownload/TaskBatchDownloadList'),
                meta: {
                  breadcrumb: false
                }
              }
            ]
          },
          {
            name: 'task.batch-search',
            path: 'batch-search',
            meta: { title: 'task.batch-search.title' },
            children: [
              {
                path: '',
                name: 'task.batch-search.list',
                component: () => import('@/views/Task/BatchSearch/TaskBatchSearchList'),
                meta: {
                  breadcrumb: false
                }
              },
              {
                name: 'task.batch-search.new',
                path: 'new',
                component: () => import('@/views/Task/BatchSearch/TaskBatchSearchNew'),
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
                component: () => import('@/views/TaskBatchSearchView'),
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
          title: 'projects.title'
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
                try {
                  return core?.findProject(route.params.name).label
                } catch (_) {
                  return null
                }
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
        component: () => import('@/views/DocumentStandalone'),
        props(route) {
          return { ...route.params, ...route.query }
        },
        meta: {
          title: 'document.title'
        },
        children: [
          {
            name: 'document-standalone.text',
            path: 'text',
            component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsText')
          },
          {
            name: 'document-standalone.viewer',
            path: 'viewer',
            component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsViewer')
          },
          {
            name: 'document-standalone.metadata',
            path: 'metadata',
            component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsMetadata')
          },
          {
            name: 'document-standalone.entities',
            path: 'entities',
            component: () => import('@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities')
          }
        ]
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
