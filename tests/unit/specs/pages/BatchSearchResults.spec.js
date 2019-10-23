import VueRouter from 'vue-router'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import BatchSearchResults from '@/pages/BatchSearchResults'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { App } from '@/main'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { getAuthenticatedUser } from '@/utils/utils'

jest.mock('@/api/DatashareClient', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([
        {
          uuid: '12',
          project: { name: 'ProjectName' },
          description: 'This is the description of the batch search',
          queries: ['query_01', 'query_02', 'query_03'],
          state: 'SUCCESS',
          date: '2019-07-18T14:45:34.869+0000',
          nbResults: 172
        }, {
          uuid: '13',
          project: { name: 'ProjectName2' },
          description: 'Another description',
          queries: ['query_04'],
          state: 'SUCCESS',
          date: '2019-07-28T14:45:34.869+0000',
          nbResults: 15
        }
      ])),
      getBatchSearchResults: jest.fn().mockReturnValue(Promise.resolve([
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentName: '42.pdf',
          contentType: 'type_03',
          query: 'query_01',
          rootId: 42
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentName: '43.pdf',
          contentType: 'type_02',
          query: 'query_01',
          rootId: 43
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentName: '44.pdf',
          contentType: 'type_01',
          query: 'query_02',
          rootId: 44
        }
      ])),
      deleteBatchSearch: jest.fn()
    }
  })
})

jest.mock('@/utils/utils', () => {
  return {
    getAuthenticatedUser: jest.fn().mockReturnValue('test'),
    getDocumentTypeLabel: jest.fn()
  }
})

const { localVue, store } = App.init(createLocalVue()).useAll()

const router = new VueRouter({ routes: [
  {
    name: 'batch-search.results',
    path: 'batch-search/:index/:uuid'
  }, {
    name: 'document',
    path: '/d/:index/:id/:routing?'
  }
] })

describe('BatchSearchResults.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let propsData, wrapper

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42').withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43').withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44').withContentType('type_01')).commit()
    store.commit('batchSearch/batchSearches', [{
      uuid: '12',
      project: { name: 'ProjectName' },
      description: 'This is the description of the batch search',
      state: 'SUCCESS',
      date: '2019-07-18T14:45:34.869+0000',
      nbResults: 172,
      phraseMatch: 1,
      fuzziness: 1,
      fileTypes: [],
      paths: [],
      published: 0,
      queries: ['query_01', 'query_02', 'query_03'],
      user: { id: 'test' }
    }, {
      uuid: '13',
      project: { name: 'ProjectName2' },
      description: 'Another description',
      state: 'SUCCESS',
      date: '2019-07-28T14:45:34.869+0000',
      nbResults: 15,
      phraseMatch: 1,
      fuzziness: 1,
      fileTypes: [],
      paths: [],
      published: 0,
      queries: ['query_04'],
      user: { id: 'test' }
    }])
    propsData = { uuid: '12', index: process.env.VUE_APP_ES_INDEX }
    wrapper = shallowMount(BatchSearchResults,
      { localVue, store, router, computed: { downloadLink: () => 'mocked-download-link', numberOfPages: () => 2 }, propsData, mocks: { $t: msg => msg } })
    await wrapper.vm.$router.push({ name: 'batch-search.results', params: { index: process.env.VUE_APP_ES_INDEX, uuid: '12' }, query: { page: 1 } })
    await wrapper.vm.fetch()
  })

  afterEach(() => store.commit('batchSearch/reset'))

  afterAll(() => {
    jest.unmock('@/api/DatashareClient')
    jest.unmock('@/utils/utils')
  })

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.find('.batch-search-results').exists()).toBeTruthy()
    expect(wrapper.find('b-table-stub').attributes('items').split(',')).toHaveLength(3)
  })

  it('should display a button to download the results as a CSV file', () => {
    expect(wrapper.find('.batch-search-results__download').exists()).toBeTruthy()
  })

  it('should display a button to delete the batchSearch', () => {
    expect(wrapper.find('.batch-search-results__delete').exists()).toBeTruthy()
  })

  it('should NOT display a button to delete the batchSearch', () => {
    getAuthenticatedUser.mockReturnValue('other')
    wrapper = shallowMount(BatchSearchResults,
      { localVue, store, router, computed: { downloadLink: () => 'mocked-download-link', numberOfPages: () => 2 }, propsData, mocks: { $t: msg => msg } })

    expect(wrapper.find('.batch-search-results__delete').exists()).toBeFalsy()
  })

  it('should display info about the BatchSearch', () => {
    expect(wrapper.find('.batch-search-results__info').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results__info dd')).toHaveLength(9)
    expect(wrapper.findAll('.batch-search-results__info dd').at(8).text()).toEqual('test')
  })

  it('should refresh route on "batch-search-results::filter" event emitted, on reset to the first page', () => {
    wrapper.vm.$set(wrapper.vm, 'page', 2)
    jest.spyOn(router, 'push')

    wrapper.vm.$root.$emit('batch-search-results::filter')

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search.results', params: { index: `${process.env.VUE_APP_ES_INDEX}`, uuid: '12' }, query: { page: 1, queries: [], sort: 'doc_nb', order: 'asc' } })
  })

  it('should redirect on sort changed', async () => {
    jest.spyOn(router, 'push')

    await wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search.results', params: { index: `${process.env.VUE_APP_ES_INDEX}`, uuid: '12' }, query: { page: 1, queries: [], sort: 'content_type', order: 'desc' } })
  })

  it('should redirect on batchSearch deletion', async () => {
    jest.spyOn(router, 'push')

    await wrapper.vm.deleteBatchSearch()

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search' })
  })

  it('should return empty string if the document size is 0', () => {
    expect(wrapper.vm.getDocumentSize(0)).toBe('')
  })

  it('should return the document size as human readable', () => {
    expect(wrapper.vm.getDocumentSize(42)).toBe('42 B')
  })
})
