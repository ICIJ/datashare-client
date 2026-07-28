import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

export const useDocumentDownloadStore = defineStore('documentDownload', () => {
  const downloadableFor = reactive({})
  const fetchPromises = {} // this doesnt need to be reactive

  /**
   * Build the memoization key of a document
   *
   * @param {Object} document - The document to key
   * @returns {string} The memoization key
   */
  const documentKey = ({ index, id, routing }) => {
    return `${index}/${id}/${routing}`
  }

  /**
   * Fetch the download status of a given document.
   *
   * The in-flight promise is memoized so several components probing the same
   * document produce a single request.
   *
   * @param {Object} document - The document to probe
   * @returns {Promise<void>}
   */
  const fetchDocumentStatus = async (document) => {
    const { index, id, routing } = document
    const key = documentKey(document)
    fetchPromises[key] ??= api.isDocumentDownloadable(index, id, routing)
    downloadableFor[key] = await fetchPromises[key]
  }

  /**
   * Check if a given document can be downloaded.
   *
   * Optimistic: a document whose status is not known yet is considered
   * downloadable, so a results page doesn't render with every download
   * button greyed out while the probes are in flight.
   *
   * @returns {Function<boolean>} The function to check if a document is downloadable
   */
  const isDownloadable = computed(() => {
    return (document) => {
      const key = documentKey(document)
      return !(key in downloadableFor) || downloadableFor[key]
    }
  })

  return { fetchDocumentStatus, isDownloadable }
})
