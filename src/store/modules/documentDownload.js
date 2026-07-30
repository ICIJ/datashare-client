import { reactive, computed } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

function extractTranslations(source = {}) {
  return (source.content_translated || []).filter(translation => translation.target_language)
}

function translationCacheKey({ index, id }) {
  return `${index}:${id}`
}

export const useDocumentDownloadStore = defineStore('documentDownload', () => {
  const downloadableFor = reactive({})
  const fetchPromises = {} // this doesnt need to be reactive
  const translationsFor = reactive({})

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

  /**
   * Fetch the translation status for a single document.
   *
   * @param {Object} options
   * @param {string} options.index - The document's index
   * @param {string} options.id - The document's id
   * @param {string} options.routing - The document's routing
   * @returns {Promise<Array>} The document's available translations
   */
  const fetchTranslationStatus = async ({ index, id, routing }) => {
    const key = translationCacheKey({ index, id })
    if (key in translationsFor) return translationsFor[key]
    try {
      const _source = 'content_translated.target_language'
      const data = await api.elasticsearch.getSource({ index, id, routing, _source })
      translationsFor[key] = extractTranslations(data)
      return translationsFor[key]
    }
    catch {
      return []
    }
  }

  return {
    fetchDocumentStatus,
    isDownloadable,
    fetchTranslationStatus
  }
})
