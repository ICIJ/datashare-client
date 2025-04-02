import bodybuilder from 'bodybuilder'
import { setActivePinia, createPinia } from 'pinia'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { elasticsearch } from '@/api/elasticsearch'
import { FilterText, FilterEntity } from '@/store/filters'
import { EventBus } from '@/utils/eventBus'

describe('elasticsearch', () => {
  const { index, es } = esConnectionHelper.build()

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should return backend response to a POST request for searchDocs', async () => {
    const spy = vi.spyOn(elasticsearch, 'search').mockResolvedValue({ foo: 'bar' })
    const response = await elasticsearch.searchDocs({ index })
    expect(response).toEqual({ foo: 'bar' })
    spy.mockRestore()
  })

  it('should emit an error if the backend response is an error', async () => {
    const spy = vi.spyOn(elasticsearch, 'search').mockRejectedValue(new Error('this is an error'))
    const mockCallback = vi.fn()
    EventBus.on('http::error', mockCallback)

    await expect(elasticsearch.searchDocs({ index })).rejects.toThrow('this is an error')

    expect(mockCallback.mock.calls).toHaveLength(1)
    expect(mockCallback.mock.calls[0][0].message).toEqual('this is an error')
    spy.mockRestore()
  })

  it('should build an ES query with filters', async () => {
    const filters = [new FilterText({ name: 'contentType', key: 'contentType', isSearchable: true })]
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
          must: [
            {
              match_all: {}
            },
            {
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
            }
          ]
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
          must: [
            {
              match_all: {}
            },
            {
              bool: {
                should: [
                  {
                    query_string: {
                      query: 'path:/home/datashare/path/*'
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    })
  })

  it('should return only one named entity', async () => {
    await letData(es)
      .have(
        new IndexedDocument('document_01', index).withContent('this is a document mentioning ne_01').withNer('ne_01')
      )
      .commit()

    await letData(es)
      .have(new IndexedDocument('document_02', index).withContent('this is a document').withNer('document'))
      .commit()

    await letData(es)
      .have(new IndexedDocument('document_03', index).withContent('this is another document').withNer('another'))
      .commit()

    const filter = new FilterEntity({ name: 'namedEntityPerson', key: 'byMentions', category: 'PERSON' })
    const response = await elasticsearch.searchFilter(index, filter, 'document')

    expect(response.aggregations.byMentions.buckets).toHaveLength(1)
  })

  it('should sort by file name', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContent('this is a document')).commit()

    await letData(es)
      .have(new IndexedDocument('DOCUMENT_02', index).withContent('this is a different document'))
      .commit()

    await letData(es).have(new IndexedDocument('document_03', index).withContent('this is another document')).commit()

    const response = await elasticsearch.searchDocs({ index, sort: 'titleNorm' })
    expect(response.hits.hits[0]._id).toEqual('document_01')
    expect(response.hits.hits[1]._id).toEqual('DOCUMENT_02')
    expect(response.hits.hits[2]._id).toEqual('document_03')
  })

  it('should sort by file name (reverse)', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContent('this is a document')).commit()

    await letData(es)
      .have(new IndexedDocument('DOCUMENT_02', index).withContent('this is a different document'))
      .commit()

    await letData(es).have(new IndexedDocument('document_03', index).withContent('this is another document')).commit()

    const response = await elasticsearch.searchDocs({ index, sort: [{ titleNorm: { order: 'desc' } }] })
    expect(response.hits.hits[0]._id).toEqual('document_03')
    expect(response.hits.hits[1]._id).toEqual('DOCUMENT_02')
    expect(response.hits.hits[2]._id).toEqual('document_01')
  })
})
