import Vuex from 'vuex'
import bodybuilder from 'bodybuilder'
import cloneDeep from 'lodash/cloneDeep'
import partial from 'lodash/partial'
import sinon from 'sinon'
import { EventBus } from '@/utils/event-bus'

import esClient from '@/api/esClient'
import { state, actions, getters, mutations } from '@/store/modules/aggregation'

describe('esClient', () => {
  var server = null
  var store = null
  const esSearchUrl = `${process.env.VUE_APP_ES_HOST}/${process.env.VUE_APP_ES_INDEX}/doc/_search`

  beforeEach(() => {
    store = new Vuex.Store({ state: cloneDeep(state), actions, getters, mutations })
    server = sinon.fakeServer.create()
    // There is two bugs here that screw the test:
    // 1) `sinon.fakeServer` doesn't map the global XMLHttpRequest so we need to
    // do it manually because JSDOM uses it's own window's instance
    global.XMLHttpRequest = global.window.XMLHttpRequest
    // 2) Elasticsearch.js client disables 'async' argument of the `open` method
    // when using PahntomJS. We need the same behavior with JSDom too so we wrap
    // the method with a partial function to always receive `false` as last argument.
    XMLHttpRequest.prototype.open = partial(XMLHttpRequest.prototype.open,
      partial.placeholder, partial.placeholder, false)
  })

  afterEach(() => {
    server.restore()
    store.commit('reset')
  })

  it('should return backend response to a POST request for searchDocs', async () => {
    server.respondWith('POST', esSearchUrl, [200, {'Content-Type': 'application/json'}, '{"foo": "bar"}'])
    let response = await esClient.searchDocs('*')
    expect(response).toEqual({ 'foo': 'bar' })
  })

  it('should emit an error if the backend response has a bad status', async () => {
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)
    server.respondWith('POST', esSearchUrl, [42, {'Content-Type': 'application/json'}, '{"error": "unauthorized"}'])

    await esClient.searchDocs('*')

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0].response).toEqual('{"error": "unauthorized"}')
  })

  it('should build an ES query with facets', async () => {
    let from = 0
    let size = 25
    let facets = [{ name: 'content-type', values: ['value_01', 'value_02', 'value_03'] }]
    let body = bodybuilder().from(from).size(size)
    await esClient.addFacetsToBody(facets, body)

    expect(body.build()).toEqual({
      from: from,
      size: size,
      query: {
        bool: {
          filter: {
            terms: {
              contentType: ['value_01', 'value_02', 'value_03']
            }
          }
        }
      }
    })
  })

  it('should build a simple ES query', async () => {
    let from = 0
    let size = 25
    let query = '*'
    let body = bodybuilder().from(from).size(size)
    await esClient.addQueryToBody(query, body)

    expect(body.build()).toEqual({
      from: from,
      size: size,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            bool: {
              should: [{
                query_string: {
                  query: query,
                  default_field: query
                }}, {
                has_child: {
                  type: 'NamedEntity',
                  inner_hits: {
                    size: 30
                  },
                  query: {
                    match: {
                      mention: query
                    }
                  }
                }
              }]
            }
          }]
        }
      }
    })
  })

  it('should build a simple ES query and escape slash in it', async () => {
    let from = 0
    let size = 25
    let body = bodybuilder().from(from).size(size)
    await esClient.addQueryToBody('path:/home/datashare/path/*', body)

    expect(body.build()).toEqual({
      from: from,
      size: size,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            bool: {
              should: [{
                query_string: {
                  query: 'path:\\/home\\/datashare\\/path\\/*',
                  default_field: '*'
                }}, {
                has_child: {
                  type: 'NamedEntity',
                  inner_hits: {
                    size: 30
                  },
                  query: {
                    match: {
                      mention: 'path:\\/home\\/datashare\\/path\\/*'
                    }
                  }
                }
              }]
            }
          }]
        }
      }
    })
  })

  it('should build a simple sorted ES query', async () => {
    let sort = 'dateOldest'
    let from = 0
    let size = 25
    let body = bodybuilder().from(from).size(size)
    await esClient.addSortToBody(sort, body)

    expect(body.build()).toEqual({
      from: from,
      size: size,
      sort: [{
        extractionDate: {
          order: 'asc'
        }
      }]
    })
  })
})
