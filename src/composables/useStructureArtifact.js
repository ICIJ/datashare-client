import { computed, ref, toRef } from 'vue'

import { apiInstance as api } from '@/api/apiInstance'

const MARKDOWN_FORMAT = 'md'

/**
 * Probe the structure artifact manifest of a document and tell whether a
 * markdown rendering is available for it.
 *
 * @param {Object|import('vue').Ref|Function} document - Document with `index`, `id` and `routing`.
 * @returns {Object} `{ hasMarkdown, pages, fetchManifest }`
 */
export function useStructureArtifact(document) {
  const documentRef = toRef(document)
  const manifest = ref(null)

  // The manifest carries the id of the document it describes: a component
  // handed another document (a slow probe resolving after the user moved on)
  // must not trust the manifest of the previous one.
  const hasMarkdown = computed(() => {
    const { documentId, pages = 0, formats = [] } = manifest.value ?? {}
    return documentId === documentRef.value?.id && pages > 0 && formats.includes(MARKDOWN_FORMAT)
  })

  const pages = computed(() => {
    return hasMarkdown.value ? manifest.value.pages : 0
  })

  let lastFetch = 0

  async function fetchManifest() {
    const { index, id, routing } = documentRef.value ?? {}
    if (!index || !id) {
      return
    }
    const fetch = ++lastFetch
    const fetched = await api.getStructureManifest(index, id, routing)
    // A probe for a document the user has already left can resolve after the
    // one for the document on screen, so only the newest may write.
    if (fetch === lastFetch) {
      manifest.value = { ...fetched, documentId: id }
    }
  }

  return { hasMarkdown, pages, fetchManifest }
}

export default useStructureArtifact
