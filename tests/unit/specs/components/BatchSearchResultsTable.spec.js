import Murmur from '@icij/murmur'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import { Core } from '@/core'
import BatchSearchResultsTable from '@/components/BatchSearchResultsTable'

describe('BatchSearchResultsTable.vue', () => {
  let wrapper = null
  let i18n, localVue, store, wait
  const router = new VueRouter({
    routes: [
      {
        name: 'task.batch-search.view.results',
        path: 'batch-search/:indices/:uuid'
      },
      {
        name: 'document-standalone',
        path: '/ds/:indices/:id/:routing?'
      }
    ]
  })
  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const propsData = { uuid: '12', indices: project.concat(',', anotherProject) }

  beforeEach(async () => {
    Murmur.config.merge({ mode: 'SERVER' })
    const api = jest.fn()
    api.getBatchSearchQueries = jest.fn()
    api.getBatchSearchResults = jest.fn().mockResolvedValue({
      items: [
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentName: '42.pdf',
          contentType: 'type_03',
          query: 'query_01',
          project: 'batchsearchresults',
          rootId: 42
        },
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentName: '43.pdf',
          contentType: 'type_02',
          query: 'query_01',
          project: 'anotherbatchsearchresults',
          rootId: 43
        },
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentName: '44.pdf',
          contentType: 'type_01',
          query: 'query_02',
          project: 'anotherbatchsearchresults',
          rootId: 44
        }
      ],
      pagination: { total: 3 }
    })
    api.getBatchSearch = jest.fn().mockResolvedValue({
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
    })
    api.copyBatchSearch = jest.fn()
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
    wrapper = shallowMount(BatchSearchResultsTable, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.find('.batch-search-results-table').exists()).toBeTruthy()
    expect(wrapper.find('b-table-stub').attributes('items').split(',')).toHaveLength(3)
  })

  it('should redirect on contentType changed', () => {
    jest.spyOn(router, 'push')

    wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({
      name: 'task.batch-search.view.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: { page: '1', sort: 'content_type', order: 'desc' }
    })
  })

  it('should redirect on sort change but keep the selectedQueries selected', () => {
    jest.spyOn(router, 'push')
    router.push({ query: { queries: ['query_01', 'query_02'] } })

    wrapper.vm.sortChanged({ sortBy: 'contentType', sortDesc: true })

    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({
      name: 'task.batch-search.view.results',
      params: { indices: project.concat(',', anotherProject), uuid: '12' },
      query: {
        page: '1',
        queries: 'query_01,query_02',
        sort: 'content_type',
        order: 'desc',
        queries_sort: undefined
      }
    })
  })

  it('should return empty string if the document size is 0', () => {
    expect(wrapper.vm.getDocumentSize(undefined)).toBe('-')
  })

  it('should return the document size as human readable', () => {
    expect(wrapper.vm.getDocumentSize(42)).toBe('42.00 B')
  })
  it('should display a pagination navigation ', () => {
    const find = wrapper.find('custom-pagination-stub')
    expect(find.exists()).toBeTruthy()
    expect(find.attributes('totalrows')).toBe('3')
  })

  it('should redirect to document including the search query', async () => {
    wrapper = mount(BatchSearchResultsTable, { i18n, localVue, store, router, wait, propsData })
    await wrapper.vm.$router
      .push({
        name: 'task.batch-search.view.results',
        params: { indices: project.concat(',', anotherProject), uuid: '12' },
        query: { page: 1 }
      })
      .catch(() => {})

    await wrapper.vm.fetch()

    expect(wrapper.findAll('.batch-search-results-table__queries__query')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-table__queries__query__link').attributes('href')).toBe(
      `#/ds/${project.concat(',', anotherProject)}/42/42?q=query_01`
    )
  })

  it('should cast queries and contentTypes param into array from the url', async () => {
    wrapper = await shallowMount(BatchSearchResultsTable, { i18n, localVue, store, router, wait, propsData })
    await wrapper.vm.$router.push({ query: { queries: 'simple_text', contentTypes: 'type_02,type_03' } })
    expect(wrapper.vm.selectedQueries).toEqual(['simple_text'])
    expect(wrapper.vm.selectedContentTypes).toEqual(['type_02', 'type_03'])
  })

  it('should cast array params like queries into string before updating route', async () => {
    wrapper.vm.updateRoute = jest.fn()
    const localThis = {
      updateRoute({ _, queries }) {
        return queries
      }
    }
    expect(BatchSearchResultsTable.computed.selectedQueries.set.call(localThis, ['simple_text', 'double_text'])).toBe(
      'simple_text,double_text'
    )
    expect(BatchSearchResultsTable.computed.selectedQueries.set.call(localThis, [])).toBeNull()
  })
})
