import bodybuilder from 'bodybuilder'

import elasticsearch from '@/api/elasticsearch'
import { FilterText, FilterNamedEntity } from '@/store/filters'
import { EventBus } from '@/utils/event-bus'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

describe('elasticsearch', () => {
  const { index, es } = esConnectionHelper.build()

  it('should return backend response to a POST request for searchDocs', async () => {
    const spy = jest.spyOn(elasticsearch, 'search').mockResolvedValue({ foo: 'bar' })
    const response = await elasticsearch.searchDocs(index, '*')
    expect(response).toEqual({ foo: 'bar' })
    spy.mockRestore()
  })

  it('should emit an error if the backend response is an error', async () => {
    const spy = jest.spyOn(elasticsearch, 'search').mockRejectedValue(new Error('this is an error'))
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    await expect(elasticsearch.searchDocs(index, '*')).rejects.toThrow('this is an error')

    expect(mockCallback.mock.calls).toHaveLength(1)
    expect(mockCallback.mock.calls[0][0].message).toEqual('this is an error')
    spy.mockRestore()
  })

  it('should build an ES query with filters', async () => {
    const filters = [new FilterText(
      { name: 'contentType', key: 'contentType', isSearchable: true })]
    filters[0].values = ['value_01', 'value_02', 'value_03']
    const body = bodybuilder().from(0).size(25)

    await elasticsearch._addFiltersToBody(filters, body)

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

    await elasticsearch._addQueryToBody('*', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            bool: {
              should: [
                {
                  query_string: {
                    query: '*',
                    fields: undefined
                  }
                }
              ]
            }
          }]
        }
      }
    })
  })

  it('should build a simple ES query and escape slash in it', async () => {
    const body = bodybuilder().from(0).size(25)

    await elasticsearch._addQueryToBody('path:/home/datashare/path/*', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      query: {
        bool: {
          must: [{
            match_all: {}
          }, {
            bool: {
              should: [
                {
                  query_string: {
                    query: 'path:/home/datashare/path/*'
                  }
                }
              ]
            }
          }]
        }
      }
    })
  })

  it('should build a simple sorted ES query', async () => {
    const body = bodybuilder().from(0).size(25)

    await elasticsearch._addSortToBody('dateOldest', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      sort: [{
        extractionDate: {
          order: 'asc'
        }
      }, {
        path: {
          order: 'asc'
        }
      }]
    })
  })

  it('should build a simple sorted ES query with correct path sort', async () => {
    const body = bodybuilder().from(0).size(25)

    await elasticsearch._addSortToBody('pathReverse', body)

    expect(body.build()).toEqual({
      from: 0,
      size: 25,
      sort: [{
        path: {
          order: 'desc'
        }
      }]
    })
  })

  it('should return the first 12 named entities', async () => {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id, index)
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

    const response = await elasticsearch.getDocumentNamedEntities(index, id, id, 0, 20)

    expect(response.hits.hits).toHaveLength(12)
  })

  it('should return only one named entity', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContent('this is a document mentioning ne_01')
      .withNer('ne_01')
    ).commit()

    await letData(es).have(new IndexedDocument('document_02', index)
      .withContent('this is a document')
      .withNer('document')
    ).commit()

    await letData(es).have(new IndexedDocument('document_03', index)
      .withContent('this is another document')
      .withNer('another')
    ).commit()

    const filter = new FilterNamedEntity({ name: 'namedEntityPerson', key: 'byMentions', category: 'PERSON' })
    const response = await elasticsearch.searchFilter(index, filter, 'document')

    expect(response.aggregations.byMentions.buckets).toHaveLength(1)
  })
})
