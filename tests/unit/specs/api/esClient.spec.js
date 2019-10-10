import bodybuilder from 'bodybuilder'
import { EventBus } from '@/utils/event-bus'
import esClient from '@/api/esClient'
import { FacetText, FacetNamedEntity } from '@/store/facetsStore'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

describe('esClient', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const index = process.env.VUE_APP_ES_INDEX

  it('should return backend response to a POST request for searchDocs', async () => {
    const spy = jest.spyOn(esClient, 'search').mockImplementation(() => Promise.resolve({ 'foo': 'bar' }))
    const response = await esClient.searchDocs(index, '*')
    expect(response).toEqual({ 'foo': 'bar' })
    spy.mockRestore()
  })

  it('should emit an error if the backend response is an error', async () => {
    const spy = jest.spyOn(esClient, 'search').mockImplementation(() => Promise.reject(new Error('this is an error')))
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    await expect(esClient.searchDocs(index, '*')).rejects.toThrow('this is an error')

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0].message).toEqual('this is an error')
    spy.mockRestore()
  })

  it('should build an ES query with facets', async () => {
    let facets = [new FacetText('content-type', 'contentType', true, null)]
    facets[0].values = ['value_01', 'value_02', 'value_03']
    const body = bodybuilder().from(0).size(25)

    await esClient._addFacetsToBody(facets, body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
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
    const body = bodybuilder().from(0).size(25)

    await esClient.addQueryToBody('*', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            query_string: {
              query: '*',
              default_field: '*'
            }
          }]
        }
      }
    })
  })

  it('should build a simple ES query and escape slash in it', async () => {
    const body = bodybuilder().from(0).size(25)

    await esClient.addQueryToBody('path:/home/datashare/path/*', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            query_string: {
              query: 'path:\\/home\\/datashare\\/path\\/*',
              default_field: '*'
            }
          }]
        }
      }
    })
  })

  it('should build a simple sorted ES query', async () => {
    let body = bodybuilder().from(0).size(25)

    await esClient.addSortToBody('dateOldest', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      sort: [{
        extractionDate: {
          order: 'asc'
        }
      }]
    })
  })

  it('should return all the named entities after scrolling', async () => {
    const docId = 'doc'
    await letData(es).have(new IndexedDocument(docId)
      .withNer('ne_01')
      .withNer('ne_02')
      .withNer('ne_03')
      .withNer('ne_04')
      .withNer('ne_05')
      .withNer('ne_06')
      .withNer('ne_07')
      .withNer('ne_08')
      .withNer('ne_09')
      .withNer('ne_10')
      .withNer('ne_11')
      .withNer('ne_12')
    ).commit()

    const response = await esClient.getNamedEntities(index, docId, docId, 5)

    expect(response.hits.hits).toHaveLength(12)
  })

  it('should return all the named entities', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContent('this is a document')
      .withNer('ne_01')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('document')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContent('nothing to write')
      .withNer('another')
    ).commit()
    const facet = new FacetNamedEntity('namedEntityPerson', 'byMentions', true, 'PERSON')

    const response = await esClient.searchFacet(index, facet, 'document')

    expect(response.aggregations.byMentions.buckets).toHaveLength(2)
  })
})
