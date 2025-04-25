import { cloneDeep, get, isObject, isString } from 'lodash'
import { computed, ref, reactive } from 'vue'
import { defineStore } from 'pinia'

import { LAYOUTS } from '@/enums/layouts'

/**
 * Defines the application-wide store for managing UI state and user preferences.
 */
export const useAppStore = defineStore(
  'app',
  () => {
    /** Default settings object, immutable. */
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

    /** Path to redirect the user after login. */
    const redirectAfterLogin = ref(null)

    /** Filters panel state. */
    const filters = reactive({ closed: true })

    /** Project pinning state (in the app sidebar). */
    const pins = reactive({ projects: [] })

    /** App sidebar state. */
    const sidebar = reactive({ compact: false, closed: false })

    /** Reactive copy of default settings for runtime modification. */
    const settings = reactive(cloneDeep(SETTINGS))

    /**
     * Gets the initial/default setting value for a given view and setting name.
     *
     * @returns {(view: string, name: string) => any}
     */
    const getSettingsInit = computed(() => {
      return (view, name) => {
        return get(SETTINGS.views, [view, name].join('.'))
      }
    })

    /**
     * Gets the current setting value for a given view and setting name.
     *
     * @returns {(view: string, name: string) => any}
     */
    const getSettings = computed(() => {
      return (view, name) => {
        return get(settings.views, [view, name].join('.'))
      }
    })

    /**
     * Sets settings for a given view either by passing an object or key-value pair.
     *
     * @param {string} view - The view identifier.
     * @param {Object|string} nameOrvalues - Setting key or object of settings.
     * @param {any} [value=null] - Value to set if a single key is provided.
     */
    const setSettings = (view, nameOrvalues = {}, value = null) => {
      if (isObject(nameOrvalues)) {
        settings.views[view] = { ...settings.views[view], ...nameOrvalues }
      } else if (isString(nameOrvalues)) {
        settings.views[view] ||= {}
        settings.views[view][nameOrvalues] = value
      }
    }

    /**
     * Sets the redirect path to be used after login.
     *
     * @param {string|null} [path=null] - Redirect path.
     */
    const setRedirectAfterLogin = (path = null) => {
      if (!path || !path.startsWith('/login')) {
        redirectAfterLogin.value = path
      }
    }

    /**
     * Retrieves and clears the redirect path set after login.
     *
     * @returns {string|null} Redirect path.
     */
    const popRedirectAfterLogin = () => {
      const path = redirectAfterLogin.value
      setRedirectAfterLogin(null)
      return path
    }

    /**
     * Checks if a project is pinned.
     *
     * @param {string} name - Project name.
     * @return {boolean} True if the project is pinned, false otherwise.
     */
    const isProjectPinned = (name) => {
      return pins.projects.includes(name)
    }

    /**
     * Pins a project by name.
     * @param {string} name - Project name.
     */
    const pinProject = (name) => {
      if (!pins.projects.includes(name)) {
        pins.projects.push(name)
      }
    }

    /**
     * Unpins a project by name.
     *
     * @param {string} name - Project name.
     */
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
