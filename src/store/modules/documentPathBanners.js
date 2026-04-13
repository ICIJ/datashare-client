import hasIn from 'lodash/hasIn'
import { reactive } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

export const useDocumentPathBannersStore = defineStore('documentPathBanners', () => {
  const pathBanners = reactive({})
  // Cache of in-flight fetch promises keyed by project, used to
  // deduplicate concurrent calls to fetchPathBannersOnce for the same project.
  const fetchPromises = {}

  /**
   * Delete all path banners for each project
   * @returns {void}
   */
  const reset = () => {
    Object.keys(pathBanners).forEach(key => delete pathBanners[key])
    Object.keys(fetchPromises).forEach(key => delete fetchPromises[key])
  }

  /**
   * Set a list of path banners for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @param {Array} options.pathBanners - The path banners to set
   * @returns {Array} The path banners set
   */
  const set = ({ project, pathBanners: values }) => {
    pathBanners[project] = values
    return values
  }

  /**
   * Get path banners for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @returns {Array} The path banners for the project
   */
  const getPathBanners = ({ project }) => {
    return pathBanners[project] || []
  }

  /**
   * Get path banners for a given path in a project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @param {string} options.path - The path to filter on
   * @returns {Array} The path banners for the path
   */
  const getPathBannersByPath = ({ project, path }) => {
    if (!hasIn(pathBanners, project)) {
      return []
    }
    return pathBanners[project].filter(banner => path.startsWith(banner.path))
  }

  /**
   * Fetch path banners from the API for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @returns {Promise<Array>} The path banners set
   */
  const fetchPathBanners = async ({ project }) => {
    const data = await api.getPathBanners(project)
    return set({ project, pathBanners: data })
  }

  /**
   * Fetch path banners once from the API for a given project.
   * Memoized: returns cached path banners if already fetched and
   * deduplicates concurrent calls for the same project.
   * @param {Object} options
   * @param {string} options.project - The project name
   * @returns {Promise<Array>} The path banners set
   */
  const fetchPathBannersOnce = async ({ project }) => {
    if (hasIn(pathBanners, project)) {
      return pathBanners[project]
    }
    fetchPromises[project] ??= fetchPathBanners({ project })
    return await fetchPromises[project]
  }

  /**
   * Fetch path banners for a given path.
   * @param {Object} options
   * @param {string} options.project - The project name
   * @param {string} options.path - The path to filter on
   * @returns {Promise<Array>} The path banners for the path
   */
  const fetchPathBannersByPath = async ({ project, path }) => {
    await fetchPathBannersOnce({ project })
    return getPathBannersByPath({ project, path })
  }

  const deletePathBanner = async ({ project, path }) => {
    await api.deletePathBanner(project, path)
    await fetchPathBanners({ project })
  }

  return { pathBanners, reset, set, getPathBannersByPath, getPathBanners, fetchPathBanners, fetchPathBannersOnce, fetchPathBannersByPath, deletePathBanner }
})
