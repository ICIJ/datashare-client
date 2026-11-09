import { computed, ref, shallowRef, toValue, watch } from 'vue'
import bodybuilder from 'bodybuilder'

import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'

export const MAX_ARCHIVE_DOCUMENTS = 10000
const SOURCE_FIELDS = [
  'title',
  'path',
  'contentType',
  'contentLength',
  'extractionLevel',
  'metadata.tika_metadata_resourcename',
  'metadata.tika_metadata_pst_folderpath'
]

/**
 * Loads the files directly inside an archive, again each time the archive changes.
 *
 * @param {MaybeRefOrGetter<Document>} archive - The archive document
 * @returns {Object} The archive files and the state of their request
 */
export function useArchiveDocuments(archive) {
  const documents = shallowRef([])
  const total = ref(0)
  const isLoading = ref(false)
  const hasError = ref(false)

  const archiveKey = computed(() => `${toValue(archive).index}/${toValue(archive).id}`)

  function buildBody() {
    return bodybuilder()
      .size(MAX_ARCHIVE_DOCUMENTS)
      .filter('term', 'type', 'Document')
      .filter('term', 'parentDocument', toValue(archive).id)
      .sort('title', 'asc')
      .rawOption('track_total_hits', true)
      .build()
  }

  function search() {
    const { index, routing } = toValue(archive)
    return api.elasticsearch._search({ index, routing, body: buildBody(), _source: SOURCE_FIELDS })
  }

  function reset() {
    documents.value = []
    total.value = 0
    hasError.value = false
    isLoading.value = true
  }

  // A response for an archive the reader already left must not replace the
  // files of the archive now on screen.
  async function load() {
    const key = archiveKey.value
    reset()
    try {
      const response = await search()
      if (key !== archiveKey.value) {
        return
      }
      documents.value = response.hits.hits.map(hit => Document.create(hit))
      total.value = response.hits.total.value
    }
    catch (error) {
      console.error('Failed to load the content of the archive:', error)
      if (key === archiveKey.value) {
        hasError.value = true
      }
    }
    finally {
      if (key === archiveKey.value) {
        isLoading.value = false
      }
    }
  }

  watch(archiveKey, load, { immediate: true })

  return { archiveKey, documents, total, isLoading, hasError }
}
