import { flatten } from 'lodash'
import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

export const useDocumentDownloadStore = defineStore('documentDownload', () => {
  const allowedFor = reactive({})
  const fetchPromises = {} // this doesnt need to be reactive

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
   * Fetch the download status for a given index
   *
   * @param {number} index - The index to fetch
   * @returns {void}
   */
  const fetchIndexStatus = async (index) => {
    fetchPromises[index] ??= api.isDownloadAllowed(index)
    const castTrue = () => true
    const castFalse = () => false
    const allowed = await fetchPromises[index].then(castTrue, castFalse)
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
    // Stricktly equal to true so download is not allowed by default
    // even if the index' status is not loaded.
    return (index) => allowedFor[index] === true
  })

  return { allow, fetchIndexStatus, fetchIndicesStatus, isAllowed }
})
