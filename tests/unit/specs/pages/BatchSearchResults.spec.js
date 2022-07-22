import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'

import Api from '@/api'
import { Core } from '@/core'
import UserDisplay from '@/components/UserDisplay'
import BatchSearchResults from '@/pages/BatchSearchResults'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

Api.getFullUrl = jest.fn() // mock static function

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearchResults: jest.fn().mockResolvedValue([
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentName: '42.pdf',
          contentType: 'type_03',
          query: 'query_01',
          project: 'batchsearchresults',
          rootId: 42
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentName: '43.pdf',
          contentType: 'type_02',
          query: 'query_01',
          project: 'anotherbatchsearchresults',
          rootId: 43
        }, {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentName: '44.pdf',
          contentType: 'type_01',
          query: 'query_02',
          project: 'anotherbatchsearchresults',
          rootId: 44
        }
      ]),
      getBatchSearch: jest.fn().mockResolvedValue({
        uuid: '12',
        projects: [{ name: 'batchsearchresults' }, { name: 'anotherbatchsearchresults' }],
        name: 'BatchSearch Test',
        description: 'This is the description of the batch search',
        state: 'SUCCESS',
        date: '2019-07-18T14:45:34.869+0000',
        nbResults: 333,
        phraseMatch: 1,
        fuzziness: 1,
        fileTypes: [],
        paths: [],
        published: true,
        queries: {
          query_01: 6,
          query_02: 6,
          query_03: 6
        },
        user: {
          id: 'test'
        }
      }),
      copyBatchSearch: jest.fn()
    }
  })
})

describe('BatchSearchResults.vue', () => {
  let wrapper = null
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter({
    routes: [
      {
        name: 'batch-search.results',
        path: 'batch-search/:indices/:uuid'
      }, {
        name: 'document-standalone',
        path: '/ds/:indices/:id/:routing?'
      }
    ]
  })
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const propsData = { uuid: '12', indices: project.concat(',', anotherProject) }

  beforeAll(() => Murmur.config.merge({ mode: 'SERVER' }))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
    wrapper = shallowMount(BatchSearchResults, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  afterAll(() => jest.unmock('@/api'))

  it('should display 7 info about the BatchSearch', () => {
    expect(wrapper.find('.batch-search-results__info').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results__info dd')).toHaveLength(7)
  })

  it('should display the author of the BatchSearch', async () => {
    expect(wrapper.findComponent(UserDisplay).attributes('username')).toBe('test')
  })

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.find('.batch-search-results').exists()).toBeTruthy()
    expect(wrapper.find('b-table-stub').attributes('items').split(',')).toHaveLength(3)
  })

  it('should redirect on sort changed', () => {
    jest.spyOn(router, 'push')

    wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({
      name: 'batch-search.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: { page: 1, queries: [], sort: 'content_type', order: 'desc' }
    })
  })

  it('should redirect on sort change but keep the selectedQueries selected', () => {
    jest.spyOn(router, 'push')
    store.commit('batchSearch/selectedQueries', [{ id: 'query_01', label: 'query_01' }])

    wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({
      name: 'batch-search.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: { page: 1, queries: ['query_01'], sort: 'content_type', order: 'desc', queries_sort: undefined }
    })
  })

  it('should return empty string if the document size is 0', () => {
    expect(wrapper.vm.getDocumentSize(undefined)).toBe('-')
  })

  it('should return the document size as human readable', () => {
    expect(wrapper.vm.getDocumentSize(42)).toBe('42.00 B')
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
      store.commit('batchSearch/selectedQueries', [{ count: 1, label: 'query_01' }])

      expect(wrapper.vm.numberOfPages).toBe(1)
    })
  })

  it('should redirect to document including the search query', async () => {
    wrapper = mount(BatchSearchResults, { i18n, localVue, store, router, wait, propsData })
    await wrapper.vm.$router.push({
      name: 'batch-search.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: { page: 1 }
    }).catch(() => {})

    await wrapper.vm.fetch()

    expect(wrapper.findAll('.batch-search-results__queries__query')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results__queries__query__link').attributes('href'))
      .toBe(`#/ds/${project.concat(',', anotherProject)}/42/42?q=query_01`)
  })

  it('should cast queries param into array on beforeRouteEnter and beforeRouteUpdate', async () => {
    wrapper = await shallowMount(BatchSearchResults, { i18n, localVue, store, router, wait, propsData })
    const toObject = {
      name: 'batch-search.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: { page: 1, queries: 'simple_text' }
    }

    BatchSearchResults.beforeRouteEnter.call(wrapper.vm, toObject, undefined, fn => fn(wrapper.vm))
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.queries).toEqual(['simple_text'])

    wrapper.vm.$store.commit('batchSearch/selectedQueries', [])

    BatchSearchResults.beforeRouteUpdate.call(wrapper.vm, toObject, undefined, jest.fn())
    expect(wrapper.vm.queries).toEqual(['simple_text'])
  })

  it('should set "selectedQueries" according to the url params on beforeRouteEnter and beforeRouteUpdate', async () => {
    wrapper = await shallowMount(BatchSearchResults, { i18n, localVue, propsData, router, store, wait })
    const to = {
      name: 'batch-search.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: { page: 1, queries: 'simple_text' }
    }

    BatchSearchResults.beforeRouteEnter.call(wrapper.vm, to, undefined, fn => fn(wrapper.vm))
    expect(wrapper.vm.$store.state.batchSearch.selectedQueries).toEqual([{ label: 'simple_text' }])

    wrapper.vm.$store.commit('batchSearch/selectedQueries', [])

    BatchSearchResults.beforeRouteUpdate.call(wrapper.vm, to, undefined, jest.fn())
    expect(wrapper.vm.$store.state.batchSearch.selectedQueries).toEqual([{ label: 'simple_text' }])
  })
})
