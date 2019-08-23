import bodybuilder from 'bodybuilder'
import es from 'elasticsearch-browser'
import each from 'lodash/each'
import find from 'lodash/find'
import replace from 'lodash/replace'

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
        return null
      }
    )
  }

  Client.prototype.getNamedEntities = async function (index, docId, routing = null, size = 200) {
    let response
    let namedEntities = []
    response = await this.search({
      index: index,
      type: 'doc',
      size: size,
      routing: routing,
      body: bodybuilder().query('parent_id', { type: 'NamedEntity', id: docId }).filter('term', 'isHidden', 'false').build(),
      scroll: '30s'
    })
    while (response.hits && response.hits.hits.length) {
      namedEntities.push(...response.hits.hits)
      response = await this.scroll({
        scrollId: response._scroll_id,
        scroll: '30s'
      })
    }
    return { hits: { hits: namedEntities } }
  }

  Client.prototype.addQueryToBody = function (query, body, fields = []) {
    // Create a top-level "MUST query" which contain a "SHOULD query" including
    // a query_string and NamedEntity. If we don't add a `match_all` query,
    // Bodybuilder ignores the query context, a MUST, and replace it by the none
    // mentioned in the nested query.
    // Escape slash by adding a backslash before it
    query = replace(query, /\//g, '\\/')
    body.query('match_all')
      .addQuery('query_string', {
        query,
        fields: fields.length ? fields : undefined,
        default_field: fields.length ? undefined : '*'
      })
  }

  Client.prototype.addQueryToFacet = function (query, body, fields = []) {
    query = replace(query, /\//g, '\\/')
    body.query('match_all')
      .addQuery('bool', b => b
        // Add the query string to the body
        .orQuery('query_string', {
          query,
          fields: fields.length ? fields : undefined,
          default_field: fields.length ? undefined : '*'
        })
        .orQuery('has_parent', 'parent_type', 'Document', {
          'inner_hits': {
            'size': 30
          }
        }, sub => sub.query('match', 'content', query))
      )
  }

  Client.prototype.addSortToBody = function (name = 'relevance', body) {
    const { field, desc } = find(settings.searchSortFields, { name }) || settings.searchSortFields[0]
    body.sort(field, desc ? 'desc' : 'asc')
  }

  Client.prototype.searchDocs = function (index, query = '*', facets = [], from = 0, size = 25, sort = 'relevance', fields = []) {
    // Avoid searching for nothing
    query = ['', null, undefined].indexOf(query) === -1 ? query : '*'
    // Return a promise that build the body composed above
    return this.search({
      index: index,
      type: 'doc',
      body: this._buildBody(from, size, facets, query, sort, fields).build()
    }).then(
      data => data,
      error => {
        EventBus.$emit('http::error', error)
        throw error
      }
    )
  }

  Client.prototype.searchFacet = function (index, facet, query = '*', facets = [], isGlobalSearch = false, options = {}, fields = []) {
    // Avoid searching for nothing
    query = ['', null, undefined].indexOf(query) === -1 ? query : '*'
    const body = facet.body(bodybuilder(), options)
    if (!isGlobalSearch) {
      each(facets, facet => facet.addFilter(body))
      this.addQueryToFacet(query, body, fields)
    }
    return esClient.search({
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

  Client.prototype._buildBody = function (from, size, facets, query, sort, fields = []) {
    const body = bodybuilder().from(from).size(size)
    this._addFacetsToBody(facets, body)
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

  Client.prototype._addFacetsToBody = function (facets, body) {
    each(facets, facet => {
      facet.applyTo(body)
    })
  }
}

const esClient = new es.Client({
  host: process.env.VUE_APP_ES_HOST || window.location.hostname + ':' + window.location.port + '/api/index/search',
  plugins: [ datasharePlugin ]
})

export default esClient
