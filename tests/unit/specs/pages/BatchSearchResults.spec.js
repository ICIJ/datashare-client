import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'

import { App } from '@/main'
import BatchSearchResults, { auth } from '@/pages/BatchSearchResults'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import Murmur from '@icij/murmur'

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([
        {
          uuid: '12',
          project: { name: 'ProjectName' },
          description: 'This is the description of the batch search',
          queries: {
            query_01: 6,
            query_02: 6,
            query_03: 6
          },
          state: 'SUCCESS',
          date: '2019-07-18T14:45:34.869+0000',
          nbResults: 333,
          published: true
        }, {
          uuid: '13',
          project: { name: 'ProjectName2' },
          description: 'Another description',
          queries: {
            query_04: 6
          },
          state: 'SUCCESS',
          date: '2019-07-28T14:45:34.869+0000',
          nbResults: 15,
          published: true
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
  const index = toLower('BatchSearchResults')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let propsData, wrapper

  beforeAll(() => Murmur.config.merge({ multipleProjects: true }))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', index).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', index).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', index).withContentType('type_01')).commit()
    store.commit('batchSearch/batchSearches', [{
      uuid: '12',
      project: { name: 'ProjectName' },
      description: 'This is the description of the batch search',
      state: 'SUCCESS',
      date: '2019-07-18T14:45:34.869+0000',
      nbResults: 333,
      phraseMatch: 1,
      fuzziness: 1,
      fileTypes: [],
      paths: [],
      published: 0,
      queries: {
        query_01: 6,
        query_02: 6,
        query_03: 6
      },
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
      queries: {
        query_04: 6
      },
      user: { id: 'test' }
    }])
    propsData = { uuid: '12', index }
    wrapper = shallowMount(BatchSearchResults,
      { localVue, store, router, computed: { downloadLink: () => 'mocked-download-link' }, propsData, mocks: { $t: msg => msg } })
    await wrapper.vm.$router.push({ name: 'batch-search.results', params: { index, uuid: '12' }, query: { page: 1 } }).catch(() => {})
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    auth.reset()
  })

  afterAll(() => jest.restoreAllMocks())

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.find('.batch-search-results').exists()).toBeTruthy()
    expect(wrapper.find('b-table-stub').attributes('items').split(',')).toHaveLength(3)
  })

  it('should display a button to download the results as a CSV file', () => {
    expect(wrapper.find('.batch-search-results__download').exists()).toBeTruthy()
  })

  it('should display a button to delete the batchSearch', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()
    expect(wrapper.find('.batch-search-results__delete').exists()).toBeTruthy()
  })

  it('should NOT display a button to delete the batchSearch', async () => {
    wrapper = shallowMount(BatchSearchResults,
      { localVue, store, router, computed: { downloadLink: () => 'mocked-download-link' }, propsData, mocks: { $t: msg => msg } })

    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    await wrapper.vm.checkIsMyBatchSearch()

    expect(wrapper.find('.batch-search-results__delete').exists()).toBeFalsy()
  })

  it('should display info about the BatchSearch', () => {
    expect(wrapper.find('.batch-search-results__info').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results__info dd')).toHaveLength(10)
    expect(wrapper.findAll('.batch-search-results__info dd').at(9).text()).toEqual('test')
  })

  it('should refresh route on "batch-search-results::filter" event emitted, on reset to the first page', () => {
    wrapper.vm.$set(wrapper.vm, 'page', 2)
    jest.spyOn(router, 'push')

    wrapper.vm.$root.$emit('batch-search-results::filter')

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search.results', params: { index, uuid: '12' }, query: { page: 1, queries: [], sort: 'doc_nb', order: 'asc' } })
  })

  it('should redirect on sort changed', async () => {
    jest.spyOn(router, 'push')

    await wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search.results', params: { index, uuid: '12' }, query: { page: 1, queries: [], sort: 'content_type', order: 'desc' } })
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

  it('should change the batchSearch published state', () => {
    jest.spyOn(store, 'dispatch')

    wrapper.vm.changePublished(false)

    expect(store.dispatch).toBeCalled()
    expect(store.dispatch).toBeCalledWith('batchSearch/updateBatchSearch', { batchId: '12', published: false })
  })

  describe('count the number of pages', () => {
    it('should display all results', () => {
      expect(wrapper.vm.numberOfPages).toBe(4)
    })

    it('should filter results and adapt number of pages', () => {
      store.commit('batchSearch/selectedQueries', ['query_01'])

      expect(wrapper.vm.numberOfPages).toBe(1)
    })
  })
})
