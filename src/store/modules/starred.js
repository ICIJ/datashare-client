import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { castArray, groupBy, findIndex, map } from 'lodash'

import { apiInstance } from '@/api/apiInstance'

export const useStarredStore = (api = apiInstance) => {
  return defineStore('starred', () => {
    // An array of documents with shape { index, id }
    const documents = reactive([])

    function reset() {
      setDocuments([])
    }

    // Replace all documents with a new list (clearing then adding new docs)
    function setDocuments(newDocuments = []) {
      documents.splice(0, documents.length)
      pushDocuments(newDocuments)
    }

    // Add a single document if it doesn't exist yet
    function pushDocument({ index, id } = {}) {
      const i = findIndex(documents, { index, id })
      if (i === -1) {
        documents.push({ index, id })
      }
    }

    // Add one or more documents (using castArray so a single object works too)
    function pushDocuments(docs = []) {
      for (const doc of castArray(docs)) {
        pushDocument(doc)
      }
    }

    // Remove a single document if it exists
    function removeDocument({ index, id } = {}) {
      const i = findIndex(documents, { index, id })
      if (i > -1) {
        documents.splice(i, 1)
      }
    }

    // Remove one or more documents
    function removeDocuments(docs = []) {
      for (const doc of castArray(docs)) {
        removeDocument(doc)
      }
    }

    // Group documents by index and extract an array of IDs for each group
    function prepareDocumentIds(docs) {
      const docsByIndex = groupBy(castArray(docs), 'index')
      const indexWithDocIds = []
      for (const [index, docs] of Object.entries(docsByIndex)) {
        indexWithDocIds.push({ index, documentIds: map(docs, 'id') })
      }
      return indexWithDocIds
    }

    // Stars one or more documents: calls the API then updates state
    async function starDocuments(docs = []) {
      for (const { index, documentIds } of prepareDocumentIds(docs)) {
        await api.starDocuments(index, documentIds)
      }
      pushDocuments(docs)
    }

    // Unstars one or more documents: calls the API then updates state
    async function unstarDocuments(docs = []) {
      for (const { index, documentIds } of prepareDocumentIds(docs)) {
        await api.unstarDocuments(index, documentIds)
      }
      removeDocuments(docs)
    }

    // Toggle the star status of a single document
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

    // Return true if a document with a given index and id is starred (exists in state)
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
