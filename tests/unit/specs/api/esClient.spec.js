import bodybuilder from 'bodybuilder'
import { EventBus } from '@/utils/event-bus'
import esClient from '@/api/esClient'
import {FacetText} from '@/store/modules/facets'

describe('esClient', () => {
  it('should return backend response to a POST request for searchDocs', async () => {
    esClient.search = jest.fn(query => Promise.resolve({ 'foo': 'bar' }))
    let response = await esClient.searchDocs('*')
    expect(response).toEqual({ 'foo': 'bar' })
  })

  it('should emit an error if the backend response is an error', async () => {
    esClient.search = jest.fn(() => Promise.reject(new Error('this is an error')))
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    await expect(esClient.searchDocs('*')).rejects.toThrow('this is an error')

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0].message).toEqual('this is an error')
  })

  it('should build an ES query with facets', async () => {
    let from = 0
    let size = 25
    let facets = [new FacetText('content-type', 'contentType', true, null)]
    facets[0].values = ['value_01', 'value_02', 'value_03']
    let body = bodybuilder().from(from).size(size)
    await esClient._addFacetsToBody(facets, body)

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
