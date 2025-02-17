import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { castArray, groupBy, findIndex, map } from 'lodash'

import { apiInstance } from '@/api/apiInstance'

export const useStarredStore = (api = apiInstance) => {
  return defineStore('starred', () => {
    // An array of documents with shape { index, id }
    const documents = reactive([])

    /**
     * Resets the state by clearing all documents.
     */
    function reset() {
      setDocuments([])
    }

    /**
     * Replace all documents with a new list (clearing then adding new docs).
     *
     * @param {Array<Object>} [newDocuments=[]] - The new list of documents.
     */
    function setDocuments(newDocuments = []) {
      documents.splice(0, documents.length)
      pushDocuments(newDocuments)
    }

    /**
     * Add a single document if it doesn't exist yet.
     *
     * @param {Object} document - The document to add.
     * @param {string|number} document.index - The index of the document.
     * @param {string|number} document.id - The id of the document.
     */
    function pushDocument({ index, id } = {}) {
      const i = findIndex(documents, { index, id })
      if (i === -1) {
        documents.push({ index, id })
      }
    }

    /**
     * Add one or more documents (using castArray so a single object works too).
     *
     * @param {Array<Object>|Object} docs - One or more document objects.
     */
    function pushDocuments(docs = []) {
      for (const doc of castArray(docs)) {
        pushDocument(doc)
      }
    }

    /**
     * Remove a single document if it exists.
     *
     * @param {Object} document - The document to remove.
     * @param {string|number} document.index - The index of the document.
     * @param {string|number} document.id - The id of the document.
     */
    function removeDocument({ index, id } = {}) {
      const i = findIndex(documents, { index, id })
      if (i > -1) {
        documents.splice(i, 1)
      }
    }

    /**
     * Remove one or more documents.
     *
     * @param {Array<Object>|Object} docs - One or more document objects to remove.
     */
    function removeDocuments(docs = []) {
      for (const doc of castArray(docs)) {
        removeDocument(doc)
      }
    }

    /**
     * Group documents by index and extract an array of IDs for each group.
     *
     * @param {Array<Object>|Object} docs - One or more document objects.
     * @returns {Array<Object>} An array of objects, each containing an index and its associated documentIds.
     */
    function prepareDocumentIds(docs) {
      const docsByIndex = groupBy(castArray(docs), 'index')
      const indexWithDocIds = []
      for (const [index, docs] of Object.entries(docsByIndex)) {
        indexWithDocIds.push({ index, documentIds: map(docs, 'id') })
      }
      return indexWithDocIds
    }

    /**
     * Stars one or more documents: calls the API then updates state.
     *
     * @param {Array<Object>|Object} docs - One or more document objects to star.
     * @returns {Promise<void>}
     */
    async function starDocuments(docs = []) {
      for (const { index, documentIds } of prepareDocumentIds(docs)) {
        await api.starDocuments(index, documentIds)
      }
      pushDocuments(docs)
    }

    /**
     * Unstars one or more documents: calls the API then updates state.
     *
     * @param {Array<Object>|Object} docs - One or more document objects to unstar.
     * @returns {Promise<void>}
     */
    async function unstarDocuments(docs = []) {
      for (const { index, documentIds } of prepareDocumentIds(docs)) {
        await api.unstarDocuments(index, documentIds)
      }
      removeDocuments(docs)
    }

    /**
     * Toggle the star status of a single document.
     *
     * @param {Object} document - The document to toggle.
     * @param {string|number} document.index - The index of the document.
     * @param {string|number} document.id - The id of the document.
     * @returns {Promise<void>}
     */
    async function toggleStarDocument({ index, id } = {}) {
      const i = findIndex(documents, { index, id })
      if (i > -1) {
        // If the document is starred, unstar it
        return unstarDocuments({ index, id })
      } else {
        // Otherwise, star it
        return starDocuments({ index, id })
      }
    }

    // Fetch starred documents for one or more indices.
    async function fetchIndicesStarredDocuments(indices = []) {
      const docs = []
      for (const index of castArray(indices)) {
        const ids = await api.getStarredDocuments(index)
        const items = castArray(ids).map((id) => ({ id, index }))
        docs.push(...items)
      }
      setDocuments(docs)
    }

    /**
     * Fetch starred documents for one or more indices.
     * Note: since there is no "rootState" in Pinia, pass in a fallback list if needed.
     *
     * @param {Array<string|number>|null} [indices=null] - Array of indices to fetch starred documents for.
     * @param {Array<string|number>} [fallbackIndices=[]] - Fallback array of indices if none provided.
     * @returns {Promise<void>}
     */
    function isStarred({ index, id } = {}) {
      return findIndex(documents, { index, id }) > -1
    }

    return {
      documents,
      reset,
      setDocuments,
      pushDocument,
      pushDocuments,
      removeDocument,
      removeDocuments,
      starDocuments,
      unstarDocuments,
      toggleStarDocument,
      fetchIndicesStarredDocuments,
      isStarred
    }
  })()
}
