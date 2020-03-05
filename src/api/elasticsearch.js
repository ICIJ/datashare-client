import each from 'lodash/each'
import find from 'lodash/find'
import isEqual from 'lodash/isEqual'
import replace from 'lodash/replace'
import bodybuilder from 'bodybuilder'
import es from 'elasticsearch-browser'

import { EventBus } from '@/utils/event-bus'
import settings from '@/utils/settings'

// Custom API for datashare
// @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/extending_core_components.html
export function datasharePlugin (Client, config, components) {
  Client.prototype.getEsDoc = function (index, id, routing = null) {
    return this.get({
      index: index,
      type: 'doc',
      id: id,
      routing: routing
    }).then(
      data => data,
      error => {
        EventBus.$emit('http::error', error)
        throw error
      }
    )
  }

  Client.prototype.getDocumentNamedEntities = async function (index, docId, routing = null, from = 0, size = 200) {
    const body = bodybuilder()
      .size(size)
      .from(from)
      .query('parent_id', {
        type: 'NamedEntity',
        id: docId
      })
      .filter('term', 'isHidden', 'false')
      .build()
    return this.search({ type: 'doc', index, routing, body })
  }

  Client.prototype.getDocumentNamedEntitiesInCategory = async function (index, docId, routing = null, from = 0, size = 200, category = null) {
    const body = bodybuilder()
      .size(size)
      .from(from)
      .query('parent_id', {
        type: 'NamedEntity',
        id: docId
      })
      .filter('term', 'isHidden', 'false')
      .filter('term', 'category', category)
      .build()
    return this.search({ type: 'doc', index, routing, body })
  }

  Client.prototype.addQueryToBody = function (query, body, fields = []) {
    if (isEqual(fields, ['path'])) replace(query, /\//g, '\\/')
    body.query('match_all')
      .addQuery('bool', b => b
        .orQuery('query_string', {
          query,
          fields: fields.length ? fields : undefined,
          default_field: fields.length ? undefined : '*'
        })
        .orQuery('has_child', 'type', 'NamedEntity',
          sub => sub.query('query_string', {
            query: query,
            default_field: 'mentionNorm'
          })
        )
      )
  }

  Client.prototype.addQueryToFilter = function (query, body, fields = []) {
    body.query('match_all')
      .addQuery('bool', b => b
        // Add the query string to the body
        .orQuery('query_string', {
          query,
          fields: fields.length ? fields : undefined,
          default_field: fields.length ? undefined : '*'
        })
        .orQuery('has_parent', 'parent_type', 'Document', {
          inner_hits: {
            size: 30
          }
        }, sub => sub.query('match', 'content', query))
      )
  }

  Client.prototype.addSortToBody = function (name = 'relevance', body) {
    const { field, desc } = find(settings.searchSortFields, { name }) || settings.searchSortFields[0]
    body.sort(field, desc ? 'desc' : 'asc')
    if (field !== 'path') body.sort('path', 'asc')
  }

  Client.prototype.searchDocs = function (index, query = '*', filters = [], from = 0, size = 25, sort = 'relevance', fields = []) {
    // Avoid searching for nothing
    query = ['', null, undefined].indexOf(query) === -1 ? query : '*'
    // Return a promise that build the body composed above
    return this.search({
      index: index,
      type: 'doc',
      body: this._buildBody(from, size, filters, query, sort, fields).build()
    }).then(
      data => data,
      error => {
        EventBus.$emit('http::error', error)
        throw error
      }
    )
  }

  Client.prototype.searchFilter = function (index, filter, query = '*', filters = [], isGlobalSearch = false, options = {}, fields = []) {
    // Avoid searching for nothing
    query = ['', null, undefined].indexOf(query) === -1 ? query : '*'
    const body = filter.body(bodybuilder(), options)
    if (!isGlobalSearch) {
      each(filters, filter => filter.addFilter(body))
      this.addQueryToFilter(query, body, fields)
    }
    return elasticsearch.search({
      index,
      type: 'doc',
      body: body.size(0).build()
    }).then(
      data => data,
      error => {
        EventBus.$emit('http::error', error)
        throw error
      }
    )
  }

  Client.prototype._buildBody = function (from, size, filters, query, sort, fields = []) {
    const body = bodybuilder().from(from).size(size)
    this._addFiltersToBody(filters, body)
    this.addQueryToBody(query, body, fields)
    this.addSortToBody(sort, body)
    // Select only the Documents and not the NamedEntities
    body.query('match', 'type', 'Document')
    // Add an option to exclude the content
    body.rawOption('_source', { includes: ['*'], excludes: ['content'] })
    // Add an option to highlight fragments in the results
    body.rawOption('highlight', {
      fields: {
        content: {
          fragment_size: 150,
          number_of_fragments: 3,
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        }
      }
    })
    return body
  }

  Client.prototype._addFiltersToBody = function (filters, body) {
    each(filters, filter => {
      filter.applyTo(body)
    })
  }
}

const elasticsearch = new es.Client({
  host: process.env.VUE_APP_ES_HOST || window.location.hostname + ':' + window.location.port + '/api/index/search',
  plugins: [datasharePlugin]
})

export default elasticsearch
