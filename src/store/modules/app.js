import { cloneDeep, get } from 'lodash'
import { computed, ref, reactive } from 'vue'
import { defineStore } from 'pinia'

import { LAYOUTS } from '@/enums/layouts'

export const useAppStore = defineStore(
  'app',
  () => {
    const SETTINGS = Object.freeze({
      closed: true,
      views: {
        projectList: {
          layout: LAYOUTS.TABLE,
          orderBy: ['name', 'asc'],
          perPage: '25'
        },
        search: {
          layout: LAYOUTS.LIST,
          orderBy: ['_score', 'desc'],
          perPage: '25',
          properties: ['title', 'thumbnail', 'highlights', 'project']
        },
        searchSavedList: {
          orderBy: ['creation_date', 'desc'],
          perPage: '25'
        },
        searchHistoryList: {
          orderBy: ['creation_date', 'desc'],
          perPage: '25',
          properties: ['title', 'thumbnail', 'path', 'creationDate']
        },
        task: {
          orderBy: ['createdAt', 'desc'],
          perPage: '10',
          properties: ['id', 'name', 'createdAt', 'progress', 'state']
        },
        taskBoardLatest: {
          properties: ['taskType', 'state', 'name', 'projects', 'author', 'createdAt', 'progress']
        },
        entities: {
          orderBy: ['createdAt', 'desc'],
          perPage: '10',
          properties: ['state', 'entitiesToFind', 'pipeline', 'project', 'progress', 'createdAt']
        },
        documents: {
          orderBy: ['createdAt', 'desc'],
          perPage: '10',
          properties: ['state', 'name', 'documents', 'project', 'progress', 'createdAt']
        },
        batchDownload: {
          orderBy: ['createdAt', 'desc'],
          perPage: '10',
          properties: ['state', 'name', 'size', 'projects', 'createdAt']
        },
        batchSearch: {
          orderBy: ['createdAt', 'desc'],
          perPage: '10',
          properties: [
            'state',
            'privacy',
            'name',
            'queries',
            'documents',
            'projects',
            'author',
            'createdAt',
            'progress'
          ]
        },
        batchSearchQueries: {
          orderBy: ['query', 'asc'],
          perPage: '100',
          properties: ['query', 'count']
        },
        batchSearchResults: {
          orderBy: ['doc_nb', 'asc'],
          perPage: '100',
          properties: ['query', 'documentNumber', 'documentName', 'contentType', 'project']
        },
        documentView: {
          tab: 'text'
        },
        documentViewMetadata: {
          pinned: {}
        }
      }
    })

    const redirectAfterLogin = ref(null)
    const filters = reactive({ close: true })
    const pins = reactive({ projects: [] })
    const sidebar = reactive({ compact: false, closed: false })
    const settings = reactive(cloneDeep(SETTINGS))

    const getSettingsInit = computed(() => {
      return (view, name) => {
        return get(SETTINGS.views, [view, name].join('.'))
      }
    })

    const getSettings = computed(() => {
      return (view, name) => {
        return get(settings.views, [view, name].join('.'))
      }
    })

    const setSettings = ({ view, ...values }) => {
      if (view in settings.views) {
        settings.views[view] = { ...settings.views[view], ...values }
      }
    }

    const setRedirectAfterLogin = (path = null) => {
      if (!path || !path.startsWith('/login')) {
        redirectAfterLogin.value = path
      }
    }

    const popRedirectAfterLogin = () => {
      const path = redirectAfterLogin.value
      setRedirectAfterLogin(null)
      return path
    }

    const isProjectPinned = computed(() => {
      return (name) => pins.projects.includes(name)
    })

    const pinProject = (name) => {
      if (!pins.projects.includes(name)) {
        pins.projects.push(name)
      }
    }

    const unpinProject = (name) => {
      pins.projects = pins.projects.filter((n) => n !== name)
    }

    return {
      redirectAfterLogin,
      filters,
      pins,
      sidebar,
      getSettingsInit,
      settings,
      setSettings,
      getSettings,
      setRedirectAfterLogin,
      popRedirectAfterLogin,
      isProjectPinned,
      pinProject,
      unpinProject
    }
  },
  {
    persist: true
  }
)
