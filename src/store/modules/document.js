import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { compact, findIndex, flattenDeep, get, map, groupBy, sortBy, sumBy, uniqBy } from 'lodash'

import EsDocList from '@/api/resources/EsDocList'
import { apiInstance as api } from '@/api/apiInstance'
import { DOCUMENT_USER_ACTIONS } from '@/enums/documentUserActions'

/**
 * Document store for managing document data, content, tags, named entities,
 * and recommendations.
 */
export const useDocumentStore = defineStore(
  'document',
  () => {
    // The current document.
    const document = ref(null)
    // Document identification and routing information.
    const idAndRouting = ref(null)
    // Indicates whether the document content is loaded.
    const isContentLoaded = ref(false)
    // Indicates whether the document is recommended.
    const isRecommended = ref(false)
    // Named entities paginated by categories.
    const namedEntitiesPaginatedByCategories = reactive({
      PERSON: [],
      ORGANIZATION: [],
      LOCATION: [],
      EMAIL: []
    })
    // The parent document.
    const parentDocument = ref(null)
    // The root document.
    const rootDocument = ref(null)
    // Array of user IDs who recommended the document.
    const recommendedBy = ref([])
    // Flag indicating whether to show translated content.
    const showTranslatedContent = ref(true)
    // Array of tags.
    const tags = ref([])
    // List user's actions states
    const userActions = reactive({
      [DOCUMENT_USER_ACTIONS.TAGS]: false,
      [DOCUMENT_USER_ACTIONS.RECOMMENDATIONS]: false
    })

    /**
     * Returns the total count of named entities in a given category.
     * @param {string} category - The entity category.
     * @returns {number} The total count.
     */
    const countNamedEntitiesInCategory = (category) => {
      const pages = get(namedEntitiesPaginatedByCategories, [category], [])
      return sumBy(pages, (page) => get(page, 'hits.length', 0))
    }

    /**
     * Returns a flat array of all named entities across categories.
     * @returns {Array} An array of named entities.
     */
    const namedEntities = computed(() => {
      const categoriesPages = Object.values(namedEntitiesPaginatedByCategories)
      const hits = categoriesPages.map((pages) => pages.map((page) => page.hits))
      return flattenDeep(hits)
    })

    /**
     * Returns the list of named entity categories.
     * @returns {Array<string>} An array of category names.
     */
    const categories = computed(() => Object.keys(namedEntitiesPaginatedByCategories))

    /**
     * Resets the store state to its initial values (except persisted fields).
     */
    function reset() {
      document.value = null
      idAndRouting.value = null
      isContentLoaded.value = false
      isRecommended.value = false
      namedEntitiesPaginatedByCategories.PERSON = []
      namedEntitiesPaginatedByCategories.ORGANIZATION = []
      namedEntitiesPaginatedByCategories.LOCATION = []
      namedEntitiesPaginatedByCategories.EMAIL = []
      parentDocument.value = null
      rootDocument.value = null
      recommendedBy.value = []
      tags.value = []
    }

    /**
     * Sets the document identification and routing, then resets the state.
     * @param {object} data - The document id and routing info.
     * @param {object} data.id - The document ID.
     * @param {object} data.index - The document index.
     * @param {object} data.routing - The document routing.
     */
    function setIdAndRouting({ id, index, routing }) {
      reset()
      idAndRouting.value = { id, index, routing }
    }

    /**
     * Sets the document by instantiating it from raw data.
     * @param {object|null} raw - The raw document data.
     */
    function setDocument(raw) {
      if (raw !== null) {
        document.value = EsDocList.instantiate(raw)
        isContentLoaded.value = document.value.hasContent
      } else {
        document.value = null
      }
    }

    /**
     * Sets the document content.
     * @param {string|null} content - The document content.
     */
    function setContent(content = null) {
      if (document.value) {
        document.value.content = content
        isContentLoaded.value = true
      }
    }

    /**
     * Sets the document translations.
     * @param {Array} translations - The translations array.
     */
    function setTranslations(translations = []) {
      if (document.value) {
        document.value.translations = translations
      }
    }

    /**
     * Sets the document tags.
     * @param {Array} newTags - The new tags array.
     */
    function setTags(newTags = []) {
      tags.value = newTags
    }

    /**
     * Adds a tag to the document.
     * @param {object} payload
     * @param {string} payload.label - The tag label (space separated).
     * @param {string|number} payload.userId - The user ID.
     */
    function pushTag({ label, userId }) {
      const user = { id: userId }
      const creationDate = Date.now()
      const words = compact(label.split(' '))
      const newTags = words.map((label) => ({ label, user, creationDate }))
      tags.value = uniqBy(tags.value.concat(newTags), 'label')
    }

    /**
     * Deletes a tag from the document.
     * @param {string} label - The tag label to remove.
     */
    function sliceTag(label) {
      const idx = findIndex(tags.value, { label })
      if (idx > -1) {
        tags.value.splice(idx, 1)
      }
    }

    /**
     * Adds a page to the named entities for a specified category.
     * @param {object} payload
     * @param {string} payload.category - The category name.
     * @param {object} payload.page - The page to add.
     */
    function addNamedEntitiesPage({ category, page }) {
      if (namedEntitiesPaginatedByCategories[category]) {
        namedEntitiesPaginatedByCategories[category].push(page)
      }
    }

    /**
     * Replaces the pages for named entities in a category.
     * @param {object} payload
     * @param {string} payload.category - The category name.
     * @param {Array} [payload.pages=[]] - The new pages.
     */
    function setNamedEntitiesPages({ category, pages = [] } = {}) {
      namedEntitiesPaginatedByCategories[category] = pages
    }

    /**
     * Sets the parent document by instantiating it from raw data.
     * @param {object|null} raw - The raw parent document data.
     * @returns {object|null} The instantiated parent document.
     */
    function setParentDocument(raw) {
      if (raw !== null) {
        parentDocument.value = EsDocList.instantiate(raw)
        if (document.value) document.value.parent = raw
      } else {
        parentDocument.value = null
      }
      return parentDocument.value
    }

    /**
     * Sets the root document by instantiating it from raw data.
     * @param {object|null} raw - The raw root document data.
     * @returns {object|null} The instantiated root document.
     */
    function setRootDocument(raw) {
      if (raw !== null) {
        rootDocument.value = EsDocList.instantiate(raw)
        if (document.value) document.value.root = raw
      } else {
        rootDocument.value = null
      }
      return rootDocument.value
    }

    /**
     * Toggles the showTranslatedContent flag.
     * @param {boolean|null} toggle - If provided, sets the flag to this value; otherwise toggles it.
     */
    function toggleTranslatedContent(toggle = null) {
      showTranslatedContent.value = toggle !== null ? toggle : !showTranslatedContent.value
    }

    /**
     * Sets the recommendation status.
     * @param {boolean} value - True if recommended, false otherwise.
     */
    function recommend(value) {
      isRecommended.value = value
    }

    /**
     * Sets the list of users who recommended the document.
     * @param {Array} arr - An array of user IDs.
     */
    function recommendBy(arr = []) {
      recommendedBy.value = arr
    }

    /**
     * Marks the document as recommended by a user.
     * @param {string|number} userId - The user ID.
     */
    function markAsRecommended(userId) {
      recommendedBy.value.push(userId)
    }

    /**
     * Unmarks the document as recommended for a user.
     * @param {string|number} userId - The user ID.
     */
    function unmarkAsRecommended(userId) {
      const idx = recommendedBy.value.indexOf(userId)
      if (idx > -1) {
        recommendedBy.value.splice(idx, 1)
      }
    }

    /**
     * Fetches a document without content and updates the store.
     * @param {object} data - The document id and routing info.
     * @param {string} data.id - The document ID.
     * @param {string} data.index - The document index.
     * @param {string} data.routing - The document routing.
     * @returns {Promise<object|null>} The fetched document.
     */
    async function getDocument({ id, index, routing }) {
      try {
        const fetchedDoc = await api.elasticsearch.getDocumentWithoutContent(index, id, routing)
        setIdAndRouting({ id, index, routing })
        setDocument(fetchedDoc)
      } catch (error) {
        setDocument(null)
      } finally {
        toggleUserAction()
      }
      return document.value
    }

    /**
     * Fetches the document content and updates the store.
     * @returns {Promise<string|undefined>} The fetched content.
     */
    async function getContent() {
      if (document.value !== null) {
        const { id, routing } = idAndRouting.value
        const { index } = document.value
        const fetched = await api.elasticsearch.getDocumentWithContent(index, id, routing)
        const translations = get(fetched, '_source.content_translated')
        const content = get(fetched, '_source.content')
        setTranslations(translations)
        setContent(content)
        return content
      }
    }

    /**
     * Retrieves a slice of the document content.
     * @param {object} options
     * @param {number} options.offset - The content offset.
     * @param {number} options.limit - The content limit.
     * @param {string} options.targetLanguage - The target language.
     * @returns {Promise<object>} The document slice.
     */
    function getContentSlice({ offset, limit, targetLanguage }) {
      if (document.value !== null) {
        const { id, routing } = idAndRouting.value
        const { index } = document.value
        const o = offset ?? 0
        const l = limit ?? 0
        return api.getDocumentSlice(index, id, o, l, targetLanguage, routing)
      }
    }

    /**
     * Updates the document content.
     * @param {string} content - The new content.
     * @returns {Promise<void>}
     */
    async function setDocumentContent(content) {
      if (document.value !== null) {
        setContent(content)
      }
    }

    /**
     * Fetches the maximum content offset for the document.
     * @param {object} options
     * @param {string} options.targetLanguage - The target language.
     * @returns {Promise<number>} The maximum offset.
     */
    async function getContentMaxOffset({ targetLanguage }) {
      if (document.value !== null) {
        const { id, routing } = idAndRouting.value
        const { index } = document.value
        const slice = await api.getDocumentSlice(index, id, 0, 0, targetLanguage, routing)
        return slice.maxOffset
      }
    }

    /**
     * Searches for occurrences of a query in the document.
     * @param {object} options
     * @param {string} options.query - The search query.
     * @param {string} options.targetLanguage - The target language.
     * @returns {Promise<object>} The search result.
     */
    async function searchOccurrences({ query, targetLanguage }) {
      if (document.value !== null) {
        const { id, routing } = idAndRouting.value
        const { index } = document.value
        return api.searchDocument(index, id, query, targetLanguage, routing)
      }
      return { count: 0, offsets: [] }
    }

    /**
     * Fetches the parent document (if applicable) and updates the store.
     * @returns {Promise<object|null>} The parent document.
     */
    async function getParentDocument() {
      if (document.value !== null && document.value.raw._source.extractionLevel > 0) {
        try {
          const { index } = document.value
          const { parentDocument: id, rootDocument: routing } = document.value.raw._source
          const fetched = await api.elasticsearch.getDocumentWithoutContent(index, id, routing)
          setParentDocument(fetched)
        } catch (error) {
          setParentDocument(null)
        }
      }
      return parentDocument.value
    }

    /**
     * Fetches the root document (if applicable) and updates the store.
     * @returns {Promise<object|null>} The root document.
     */
    async function getRootDocument() {
      if (document.value !== null && document.value.raw._source.extractionLevel > 0) {
        try {
          const { index } = document.value
          const { rootDocument: id } = document.value.raw._source
          const fetched = await api.elasticsearch.getDocumentWithoutContent(index, id, id)
          setRootDocument(fetched)
        } catch (error) {
          setRootDocument(null)
        }
      }
      return rootDocument.value
    }

    /**
     * Fetches the first page of named entities for a specified category.
     * @param {object} options
     * @param {string} options.category - The category name.
     * @param {string|null} [options.filterToken=null] - An optional filter token.
     * @returns {Promise<object>} The first page result.
     */
    async function getFirstPageForNamedEntityInCategory({ category, filterToken = null } = {}) {
      setNamedEntitiesPages({ category, pages: [] })
      return getNextPageForNamedEntityInCategory({ category, filterToken })
    }

    /**
     * Fetches the first page of named entities for all categories.
     * @param {object} options
     * @param {string|null} [options.filterToken=null] - An optional filter token.
     * @returns {Promise<Array>} An array of first page results for each category.
     */
    async function getFirstPageForNamedEntityInAllCategories({ filterToken = null } = {}) {
      return Promise.all(
        categories.value.map((category) => getFirstPageForNamedEntityInCategory({ filterToken, category }))
      )
    }

    /**
     * Fetches the next page of named entities for a given category.
     * @param {object} options
     * @param {string} options.category - The category name.
     * @param {string|null} [options.filterToken=null] - An optional filter token.
     * @returns {Promise<void>}
     */
    async function getNextPageForNamedEntityInCategory({ category, filterToken = null } = {}) {
      try {
        const from = countNamedEntitiesInCategory(category)
        const index = document.value.index
        const { id, routing } = document.value
        const raw = await api.elasticsearch.getDocumentNamedEntitiesInCategory(
          index,
          id,
          routing,
          from,
          50,
          category,
          filterToken
        )
        const page = new EsDocList(raw)
        if (from === 0) {
          setNamedEntitiesPages({ category, pages: [page] })
        } else {
          addNamedEntitiesPage({ category, page })
        }
      } catch (error) {
        // Fail silently on error
      }
    }

    /**
     * Fetches tags for the document and updates the store.
     * @returns {Promise<Array>} The array of tags.
     */
    async function getTags() {
      try {
        setTags(await api.getTags(document.value.index, document.value.id))
      } catch (error) {
        setTags([])
      }
      return tags.value
    }

    /**
     * Adds a tag to the document (dispatches multiple tag additions).
     * @param {object} payload
     * @param {Array} payload.documents - An array of documents.
     * @param {string} payload.label - The tag label.
     */
    async function addTag({ documents, label }) {
      await addTags({ documents, labels: compact(label.split(' ')) })
    }

    /**
     * Adds multiple tags to documents.
     * @param {object} payload
     * @param {Array} payload.documents - An array of documents.
     * @param {Array} payload.labels - An array of tag labels.
     */
    async function addTags({ documents, labels }) {
      const grouped = groupBy(documents, 'index')
      for (const [index, subset] of Object.entries(grouped)) {
        await api.tagDocuments(index, map(subset, 'id'), labels)
      }
      await getTags()
    }

    /**
     * Deletes a tag from documents.
     * @param {object} payload
     * @param {Array} payload.documents - An array of documents.
     * @param {string} payload.label - The tag label to delete.
     */
    async function deleteTag({ documents, label }) {
      const grouped = groupBy(documents, 'index')
      for (const [index, subset] of Object.entries(grouped)) {
        await api.untagDocuments(index, map(subset, 'id'), [label])
      }
      await getTags()
    }

    /**
     * Toggles the recommended status of the document.
     * @param {string|number} userId - The user ID.
     * @returns {Promise<void>}
     */
    async function toggleAsRecommended(userId) {
      try {
        if (isRecommended.value) {
          await api.setUnmarkAsRecommended(document.value.index, [document.value.id])
        } else {
          await api.setMarkAsRecommended(document.value.index, [document.value.id])
        }
      } finally {
        await getRecommendationsByDocuments(userId)
      }
    }

    /**
     * Fetches recommendations for the document and updates the store.
     * @param {string|number} userId - The user ID.
     * @returns {Promise<Array>} An array of recommended user IDs.
     */
    async function getRecommendationsByDocuments(userId) {
      try {
        const recommendedData = await api.getRecommendationsByDocuments(document.value.index, document.value.id)
        const sorted = sortBy(get(recommendedData, 'aggregates', []), 'item.id')
        recommendBy(map(sorted, 'item.id'))
        const idx = recommendedBy.value.indexOf(userId)
        recommend(idx > -1)
      } catch (error) {
        recommendBy([])
        recommend(false)
      }
      return recommendedBy.value
    }

    /**
     * Toggles the state of the specified user action.
     *
     * If the action is already active, it will be deactivated; otherwise, it will be activated.
     * This function ensures that only one user action can be active at a time.
     *
     * @param {string} name - The name of the user action.
     */
    function toggleUserAction(name) {
      for (const key in userActions) {
        userActions[key] = name && key === name && !userActions[key]
      }
    }

    /**
     * Checks if a user action is currently visible.
     *
     * @param {string} name - The name of the user action.
     * @returns {boolean} True if the user action is visible, false otherwise.
     */
    function isUserActionVisible(name) {
      return userActions[name] ?? false
    }

    return {
      // Expose state variables
      document,
      idAndRouting,
      isContentLoaded,
      isRecommended,
      namedEntitiesPaginatedByCategories,
      parentDocument,
      recommendedBy,
      rootDocument,
      showTranslatedContent,
      tags,
      // Expose getters
      countNamedEntitiesInCategory,
      namedEntities,
      categories,
      // Expose actions
      reset,
      setIdAndRouting,
      setDocument,
      setContent,
      setTranslations,
      setTags,
      pushTag,
      sliceTag,
      addNamedEntitiesPage,
      setNamedEntitiesPages,
      setParentDocument,
      setRootDocument,
      toggleTranslatedContent,
      recommend,
      recommendBy,
      markAsRecommended,
      unmarkAsRecommended,
      getDocument,
      getContent,
      getContentSlice,
      setDocumentContent,
      getContentMaxOffset,
      searchOccurrences,
      getParentDocument,
      getRootDocument,
      getFirstPageForNamedEntityInCategory,
      getFirstPageForNamedEntityInAllCategories,
      getNextPageForNamedEntityInCategory,
      getTags,
      addTag,
      addTags,
      deleteTag,
      toggleAsRecommended,
      getRecommendationsByDocuments,
      toggleUserAction,
      isUserActionVisible
    }
  },
  {
    persist: {
      pick: ['showTranslatedContent']
    }
  }
)

export default useDocumentStore
