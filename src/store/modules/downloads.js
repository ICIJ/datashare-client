import { has, flatten } from 'lodash'
import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

export const useDownloadsStore = defineStore('downloads', () => {
  const allowedFor = reactive({})

  /**
   * Allow download for a given index
   *
   * @param {Object} options
   * @param {number} options.index - The index to allow
   * @param {boolean} options.allowed - The allowed status
   */
  const allow = ({ index, allowed }) => {
    allowedFor[index] = !!allowed
  }

  /**
   * Get the download status for a given index
   *
   * @param {number} index - The index to check
   * @returns {boolean} The download status
   */
  const getIndexStatus = async (index) => {
    try {
      if (!has(allowedFor, index)) {
        // Not allowed index will throw an error
        await api.isDownloadAllowed(index)
      }
      return true
    } catch (_) {
      return false
    }
  }

  /**
   * Fetch the download status for a given index
   *
   * @param {number} index - The index to fetch
   * @returns {void}
   */
  const fetchIndexStatus = async (index) => {
    const allowed = await getIndexStatus(index)
    allow({ index, allowed })
  }

  /**
   * Fetch the download status for all indices
   * @param {Array<number>} indices - The indices to fetch
   * @returns {void}
   */
  const fetchIndicesStatus = async (...indices) => {
    for (const index of flatten(indices)) {
      await fetchIndexStatus(index)
    }
  }

  /**
   * Check if download is allowed for a given index
   *
   * @returns {Function<boolean>} The function to check if download is allowed
   */
  const isAllowed = computed(() => {
    return (index) => {
      // Stricktly equal to true so download is allowed by default
      // even if the index' status is not loaded.
      return allowedFor[index] === true
    }
  })

  return { allow, getIndexStatus, fetchIndexStatus, fetchIndicesStatus, isAllowed }
})
