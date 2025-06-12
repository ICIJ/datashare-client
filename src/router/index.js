import { MODE_NAME } from '@/mode'

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
          icon: PhMagnifyingGlass,
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
            }
          }
        ]
      },
      {
        name: 'search.saved.list',
        path: 'search/saved',
        meta: {
          icon: PhListChecks,
          title: 'searchSavedList.title'
        },
        components: {
          default: () => import('@/views/Search/SearchSaved/SearchSavedList/SearchSavedList'),
          settings: () => import('@/views/Search/SearchSaved/SearchSavedList/SearchSavedListSettings')
        }
      },
      {
        name: 'search.history.list',
        path: 'search/history',
        meta: {
          icon: PhClockCounterClockwise,
          title: 'searchHistoryList.title'
        },
        components: {
          default: () => import('@/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList'),
          settings: () => import('@/views/Search/SearchHistory/SearchHistoryList/SearchHistoryListSettings')
        }
      },
      {
        name: 'task',
        path: 'tasks',
        components: {
          default: () => import('@/views/Task/Task'),
          settings: () => import('@/views/Task/TaskListSettings')
        },
        meta: {
          title: 'task.title',
          icon: PhRocketLaunch
        },
        children: [
          {
            path: '',
            name: 'task.task-board-redirect',
            redirect: '/tasks/task-board'
          },
          {
            name: 'task.task-board',
            path: 'task-board',
            meta: {
              title: 'task.task-board.title',
              icon: PhDotsNine,
              settings: false
            },
            component: () => import('@/views/Task/TaskBoard/TaskBoard')
          },
          {
            name: 'task.entities',
            path: 'entities',
            meta: {
              title: 'task.entities.title',
              icon: PhUsersThree
            },
            children: [
              {
                name: 'task.entities.list',
                path: '',
                component: () => import('@/views/Task/TaskEntities/TaskEntitiesList'),
                meta: {
                  breadcrumb: false
                }
              },
              {
                name: 'task.entities.new',
                props: ({ query }) => ({ project: query.project }),
                path: 'new',
                component: () => import('@/views/Task/TaskEntities/TaskEntitiesNew'),
                meta: {
                  title: 'task.entities.new.title',
                  icon: PhPlus
                }
              }
            ]
          },
          {
            name: 'task.documents',
            path: 'documents',
            meta: {
              title: 'task.documents.title',
              icon: PhFiles,
              allowedModes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
            },
            children: [
              {
                name: 'task.documents.list',
                path: '',
                component: () => import('@/views/Task/TaskDocuments/TaskDocumentsList'),
                meta: {
                  breadcrumb: false
                }
              },
              {
                name: 'task.documents.new',
                path: 'new',
                component: () => import('@/views/Task/TaskDocuments/TaskDocumentsNew'),
                props: ({ query }) => ({ project: query.project }),
                meta: {
                  title: 'task.documents.new.title',
                  icon: PhPlus
                }
              }
            ]
          },
          {
            name: 'task.batch-download',
            path: 'batch-download',
            meta: {
              title: 'task.batch-download.title',
              icon: PhDownloadSimple
            },
            children: [
              {
                name: 'task.batch-download.list',
                path: '',
                component: () => import('@/views/Task/TaskBatchDownload/TaskBatchDownloadList'),
                meta: {
                  breadcrumb: false
                }
              }
            ]
          },
          {
            name: 'task.batch-search',
            path: 'batch-search',
            meta: {
              title: 'task.batch-search.title',
              icon: PhListMagnifyingGlass
            },
            children: [
              {
                path: '',
                name: 'task.batch-search.list',
                component: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchList'),
                meta: {
                  breadcrumb: false,
                  icon: PhListMagnifyingGlass
                }
              },
              {
                name: 'task.batch-search.new',
                path: 'new',
                component: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchNew'),
                meta: {
                  title: 'task.batch-search.new.title',
                  icon: PhPlus,
                  docs: [
                    {
                      title: 'How to use batch searches',
                      path: 'all/batch-search-documents'
                    }
                  ]
                }
              },
              {
                path: ':indices/:uuid',
                props: true,
                name: 'task.batch-search-results.list',
                components: {
                  default: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchResultList'),
                  settings: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchQueryResultListSettings')
                },
                meta: {
                  title: 'task.batch-search-results.list.title'
                }
              },
              {
                path: ':indices/:uuid/queries',
                props: true,
                name: 'task.batch-search-queries.list',
                components: {
                  default: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchQueryList'),
                  settings: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchQueryListSettings')
                },
                meta: {
                  title: 'task.batch-search-queries.list.title',
                  icon: null
                }
              },
              {
                path: ':indices/:uuid/:query',
                props: true,
                name: 'task.batch-search-queries.show',
                components: {
                  default: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchQueryResultList'),
                  settings: () => import('@/views/Task/TaskBatchSearch/TaskBatchSearchQueryResultListSettings')
                },
                meta: {
                  title: 'task.batch-search-results.show.title'
                }
              }
            ]
          }
        ]
      },
      {
        path: 'projects',
        name: 'project',
        meta: {
          icon: PhCirclesThreePlus,
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
              icon: PhDotsNine,
              title: 'appSidebar.allProjects'
            }
          },
          {
            name: 'project.new',
            path: 'new',
            components: {
              default: () => import('@/views/Project/ProjectNew')
            },
            meta: {
              icon: PhPlus,
              title: 'projectNew.title',
              allowedModes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
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
                      icon: PhChartBar,
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
                      icon: PhTreeStructure,
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
                      icon: PhPolygon,
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
                      icon: PhInfo,
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
                      icon: PhClockCounterClockwise,
                      title: 'projectViewOverview.nav.history'
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
                  icon: PhPencilSimple,
                  title: 'projectViewEdit.title',
                  allowedModes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
                }
              }
            ]
          }
        ]
      },
      {
        name: 'settings',
        path: '/settings',
        meta: {
          title: 'settings.title',
          icon: PhGear
        },
        component: () => import('@/views/Settings/SettingsView/SettingsView'),
        children: [
          {
            path: '',
            redirect: '/settings/appearance'
          },
          {
            name: 'settings.general',
            path: 'general',
            component: () => import('@/views/Settings/SettingsView/SettingsViewGeneral'),
            meta: {
              title: 'settings.general.title',
              breadcrumb: false,
              allowedModes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
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
            props: {
              addonsType: 'plugin'
            },
            meta: {
              title: 'settings.addons.extension.title',
              breadcrumb: false,
              allowedModes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
            }
          },
          {
            name: 'settings.extensions',
            path: 'extensions',
            component: () => import('@/views/Settings/SettingsView/SettingsViewAddons'),
            props: {
              addonsType: 'extension'
            },
            meta: {
              title: 'settings.addons.plugin.title',
              breadcrumb: false,
              allowedModes: [MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]
            }
          },
          {
            name: 'settings.api',
            path: 'api',
            component: () => import('@/views/Settings/SettingsView/SettingsViewApi'),
            meta: {
              title: 'settings.api.title',
              breadcrumb: false,
              allowedModes: [MODE_NAME.SERVER]
            }
          }
        ]
      },
      {
        name: 'shortcuts',
        path: '/shortcuts',
        component: () => import('@/views/Shortcuts/ShortcutsView/ShortcutsView'),
        meta: {
          title: 'shortcutsView.title',
          icon: PhKeyboard
        }
      },
      {
        name: 'document-standalone',
        path: '/ds/:index/:id/:routing?',
        alias: '/dm/:index/:id/:routing?',
        component: () => import('@/views/Document/DocumentStandalone'),
        props(route) {
          return { ...route.params, ...route.query }
        },
        meta: {
          title: 'document.title'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login/Login'),
    meta: {
      skipsAuth: true,
      title: 'login.title'
    }
  },
  {
    name: 'error',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error/Error'),
    props: true,
    meta: {
      skipsAuth: true,
      title: 'error.title'
    }
  }
]

export default { routes }
