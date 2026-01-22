import { isEqual, replace } from 'lodash'
import bodybuilder from 'bodybuilder'
import es from 'elasticsearch-browser'

import { EventBus } from '@/utils/eventBus'
import settings from '@/utils/settings'

// Content fields to exclude from search results (large text fields)
const CONTENT_FIELDS = ['content', 'content_translated']

// Default query when none is provided
const DEFAULT_QUERY = '*'

// Search preferences for caching
const PREFERENCE = Object.freeze({
  DOCUMENTS_COUNT: 'project-documents-count',
  TAGS_COUNT: 'project-tags-count',
  COUNT_BY_PROJECT: 'count-by-project',
  MAX_EXTRACTION_DATE: 'max-extraction-date-by-project'
})

// Highlight configuration for search results
const HIGHLIGHT_CONFIG = Object.freeze({
  fields: {
    'content': {
      fragment_size: 280,
      number_of_fragments: 2,
      pre_tags: ['<mark>'],
      post_tags: ['</mark>']
    },
    'content_translated.content': {
      fragment_size: 280,
      number_of_fragments: 2,
      pre_tags: ['<mark>'],
      post_tags: ['</mark>']
    }
  }
})

/**
 * Normalizes a query string, returning the default query for empty values.
 * @param {string} query - The query string to normalize
 * @returns {string} The normalized query
 */
function normalizeQuery(query) {
  return [null, undefined, ''].includes(query) ? DEFAULT_QUERY : query
}

/**
 * Emits an error event and re-throws the error.
 * @param {Error} error - The error to handle
 */
function handleSearchError(error) {
  EventBus.emit('http::error', error)
  throw error
}

/**
 * Custom API plugin for Datashare extending the Elasticsearch client.
 * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/16.x/extending_core_components.html
 */
export function datasharePlugin(Client) {
  /**
   * Retrieves a document by ID.
   * @param {string} index - The index name
   * @param {string} id - The document ID
   * @param {string|null} [routing=null] - Optional routing value
   * @param {Object} [params={}] - Additional parameters
   * @returns {Promise<Object>} The document
   */
  Client.prototype.getDocument = function (index, id, routing = null, params = {}) {
    try {
      return this.get({ index, id, routing, ...params })
    }
    catch (error) {
      handleSearchError(error)
    }
  }

  /**
   * Retrieves a document without its content fields.
   * @param {string} index - The index name
   * @param {string} id - The document ID
   * @param {string|null} [routing=null] - Optional routing value
   * @returns {Promise<Object>} The document without content
   */
  Client.prototype.getDocumentWithoutContent = async function (index, id, routing = null) {
    return this.getDocument(index, id, routing, {
      _source_excludes: CONTENT_FIELDS.join(',')
    })
  }

  /**
   * Retrieves a document with only its content fields.
   * @param {string} index - The index name
   * @param {string} id - The document ID
   * @param {string|null} [routing=null] - Optional routing value
   * @returns {Promise<Object>} The document with content only
   */
  Client.prototype.getDocumentWithContent = async function (index, id, routing = null) {
    return this.getDocument(index, id, routing, {
      _source: CONTENT_FIELDS.join(',')
    })
  }

  /**
   * Retrieves multiple documents by their IDs.
   * @param {string} index - The index name
   * @param {string[]} [ids=[]] - Array of document IDs
   * @param {string|null} [source=null] - Source filtering
   * @returns {Promise<Object>} Search results containing the documents
   */
  Client.prototype.getDocumentsByIds = function (index, ids = [], source = null) {
    const body = { query: { ids: { values: ids } } }
    return this._search({ index, size: ids.length, body, _source: source })
  }

  /**
   * Internal search method with error handling.
   * @private
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  Client.prototype._search = function (params) {
    return this.search({ ...params }).then(data => data, handleSearchError)
  }

  /**
   * Searches for documents with filters, pagination, and highlighting.
   * @param {Object} options - Search options
   * @param {string} options.index - The index name
   * @param {string} [options.query='*'] - Query string
   * @param {Array} [options.filters=[]] - Array of filter objects
   * @param {number} [options.from=0] - Starting offset for pagination
   * @param {number} [options.perPage=25] - Number of results per page
   * @param {Object} [options.sort] - Sort configuration
   * @param {string[]} [options.fields=[]] - Fields to search in
   * @returns {Promise<Object>} Search results
   */
  Client.prototype.searchDocs = function ({
    index,
    query = DEFAULT_QUERY,
    filters = [],
    from = 0,
    perPage = 25,
    sort = { _score: { order: 'desc' } },
    fields = []
  }) {
    const body = this._buildSearchBody({
      query: normalizeQuery(query),
      filters,
      fields,
      from,
      size: perPage,
      sort
    })
    return this._search({ index, body })
  }

  /**
   * Searches within a specific filter context.
   * @param {string} index - The index name
   * @param {Object} filter - The filter object
   * @param {string} [query='*'] - Query string
   * @param {Array} [filters=[]] - Additional filters
   * @param {boolean} [contextualize=true] - Whether to apply context filters
   * @param {Object} [options={}] - Filter options
   * @param {string[]} [fields=[]] - Fields to search in
   * @param {number} [from=0] - Starting offset
   * @param {number} [size=8] - Number of results
   * @returns {Promise<Object>} Search results
   */
  Client.prototype.searchFilter = function (
    index,
    filter,
    query = DEFAULT_QUERY,
    filters = [],
    contextualize = true,
    options = {},
    fields = [],
    from = 0,
    size = 8
  ) {
    const { preference } = filter
    let body = filter.body(bodybuilder(), options, from, size)

    if (contextualize) {
      this._applyFilters(body, filters)
      this._applyQueryString(body, normalizeQuery(query), fields)
    }

    body = body.size(0).rawOption('track_total_hits', true).build()
    return this._search({ index, body, preference })
  }

  /**
   * Retrieves named entities for a document filtered by category.
   * @param {string} index - The index name
   * @param {string} docId - The parent document ID
   * @param {string|null} [routing=null] - Optional routing value
   * @param {number} [from=0] - Starting offset for pagination
   * @param {number} [size=200] - Number of results
   * @param {string|null} [category=null] - Entity category filter
   * @param {string|null} [filterToken=null] - Token to filter entity mentions
   * @returns {Promise<Object>} Search results with named entities
   */
  Client.prototype.getDocumentNamedEntitiesInCategory = async function (
    index,
    docId,
    routing = null,
    from = 0,
    size = 200,
    category = null,
    filterToken = null
  ) {
    const frequencySort = {
      _script: {
        type: 'number',
        script: { source: 'doc[\'offsets\'].size()' },
        order: 'desc'
      }
    }

    const mentionSort = { mentionNorm: 'asc' }

    const body = bodybuilder()
      .size(size)
      .from(from)
      .query('parent_id', { type: 'NamedEntity', id: docId })
      .sort([frequencySort, mentionSort])
      .filter('term', 'isHidden', 'false')
      .filter('term', 'category', category)
      .rawOption('track_total_hits', true)

    if (filterToken) {
      const fields = ['mentionNorm', 'mention']
      const query = `*${filterToken}*`
      body.query('query_string', { fields, query })
    }

    return this._search({ index, routing, body: body.build() })
  }

  /**
   * Counts the total number of documents in an index.
   * @param {string} index - The index name
   * @returns {Promise<number>} The document count
   */
  Client.prototype.countDocuments = async function (index) {
    const body = { query: { query_string: { query: 'type:Document' } } }
    const res = await this.count({ index, body, preference: PREFERENCE.DOCUMENTS_COUNT })
    return res?.count ?? 0
  }

  /**
   * Counts the number of unique tags in an index.
   * @param {string} index - The index name
   * @returns {Promise<number>} The unique tag count
   */
  Client.prototype.countTags = async function (index) {
    const body = {
      size: 0,
      aggs: { count: { cardinality: { field: 'tags' } } }
    }
    const res = await this.search({ index, body, preference: PREFERENCE.TAGS_COUNT })
    return res?.aggregations?.count?.value ?? 0
  }

  /**
   * Counts documents grouped by project/index.
   * @param {string} index - The index pattern
   * @param {Object} [query=undefined] - Optional query filter
   * @param {number} [size=1000] - Maximum number of buckets
   * @returns {Promise<Object>} Aggregation results with counts per project
   */
  Client.prototype.countByProject = function (index, query = undefined, size = 1000) {
    const body = {
      size: 0,
      query,
      aggs: { index: { terms: { field: '_index', size } } }
    }
    return this._search({ index, body, preference: PREFERENCE.COUNT_BY_PROJECT })
  }

  /**
   * Gets the maximum extraction date for each project/index.
   * @param {string} index - The index pattern
   * @param {Object} [query=undefined] - Optional query filter
   * @param {number} [size=1000] - Maximum number of buckets
   * @returns {Promise<Object>} Aggregation results with max extraction dates
   */
  Client.prototype.maxExtractionDateByProject = function (index, query = undefined, size = 1000) {
    const body = {
      size: 0,
      query,
      aggs: {
        index: {
          terms: { field: '_index', size },
          aggs: { maxExtractionDate: { max: { field: 'extractionDate' } } }
        }
      }
    }
    return this._search({ index, body, preference: PREFERENCE.MAX_EXTRACTION_DATE })
  }

  /**
   * Applies an array of filters to a body builder.
   * @private
   * @param {Object} body - The bodybuilder instance
   * @param {Array} filters - Array of filter objects
   */
  Client.prototype._applyFilters = function (body, filters) {
    filters.forEach(filter => filter.addFilter(body))
  }

  /**
   * Applies a query string to a body builder.
   * @private
   * @param {Object} body - The bodybuilder instance
   * @param {string} query - The query string
   * @param {string[]} [fields=[]] - Fields to search in
   */
  Client.prototype._applyQueryString = function (body, query, fields = []) {
    if (isEqual(fields, ['path'])) {
      query = replace(query, /\//g, '\\/')
    }
    body.query('match_all').addQuery('bool', b =>
      b.orQuery('query_string', {
        query,
        fields: fields.length ? fields : undefined
      })
    )
  }

  /**
   * Builds a complete search body with filters, query, pagination, and highlighting.
   * @private
   * @param {Object} options - Build options
   * @param {string} options.query - The query string
   * @param {Array} options.filters - Array of filter objects
   * @param {string[]} options.fields - Fields to search in
   * @param {number} options.from - Starting offset
   * @param {number} options.size - Number of results
   * @param {Object} options.sort - Sort configuration
   * @returns {Object} The built search body
   */
  Client.prototype._buildSearchBody = function ({ query, filters, fields, from, size, sort }) {
    const body = bodybuilder()

    // Apply filters
    filters.forEach(filter => filter.applyTo(body))

    // Apply query string
    this._applyQueryString(body, query, fields)

    // Filter to documents only
    body.query('match', 'type', 'Document')

    // Pagination and sorting
    body.from(from).size(size).sort(sort)

    // Exclude large content fields from response
    body.rawOption('_source', {
      includes: ['*'],
      excludes: CONTENT_FIELDS
    })

    // Add highlighting
    body.rawOption('highlight', HIGHLIGHT_CONFIG)

    // Ensure accurate total hits count (ES 8+ compatibility)
    body.rawOption('track_total_hits', true)

    return body.build()
  }

  /**
   * @deprecated Use getDocumentsByIds instead
   * @alias getDocumentsByIds
   */
  Client.prototype.ids = Client.prototype.getDocumentsByIds

  /**
   * @deprecated Use _applyQueryString instead
   * @alias _applyQueryString
   */
  Client.prototype.addQueryToFilter = Client.prototype._applyQueryString

  /**
   * @deprecated Use _applyQueryString instead
   * @alias _applyQueryString
   */
  Client.prototype._addQueryToBody = Client.prototype._applyQueryString

  /**
   * Applies filters to a body builder using applyTo method.
   * @deprecated
   * @param {Array} filters - Array of filter objects
   * @param {Object} body - The bodybuilder instance
   */
  Client.prototype._addFiltersToBody = function (filters, body) {
    filters.forEach(filter => filter.applyTo(body))
  }

  /**
   * Creates a base search body for documents.
   * @deprecated Use _buildSearchBody instead
   * @param {Array} filters - Array of filter objects
   * @param {string} query - The query string
   * @param {string[]} [fields=[]] - Fields to search in
   * @returns {Object} The bodybuilder instance
   */
  Client.prototype.rootSearch = function (filters, query, fields = []) {
    const body = bodybuilder()
    this._addFiltersToBody(filters, body)
    this._addQueryToBody(query, body, fields)
    body.query('match', 'type', 'Document')
    return body
  }

  /**
   * Builds a search body with pagination and highlighting.
   * @deprecated Use _buildSearchBody instead
   * @param {number} from - Starting offset
   * @param {number} size - Number of results
   * @param {Array} filters - Array of filter objects
   * @param {string} query - The query string
   * @param {Object} sort - Sort configuration
   * @param {string[]} [fields=[]] - Fields to search in
   * @returns {Object} The bodybuilder instance
   */
  Client.prototype._buildBody = function (from, size, filters, query, sort, fields = []) {
    const body = this.rootSearch(filters, query, fields)
    body.from(from).size(size).sort(sort)
    body.rawOption('_source', { includes: ['*'], excludes: CONTENT_FIELDS })
    body.rawOption('highlight', HIGHLIGHT_CONFIG)
    return body
  }
}

const elasticsearch = new es.Client({
  host: import.meta.env.VITE_ES_HOST || `${window.location.hostname}:${window.location.port}/api/index/search`,
  plugins: [datasharePlugin],
  requestTimeout: settings.elasticsearch.requestTimeout
})

export { elasticsearch }
