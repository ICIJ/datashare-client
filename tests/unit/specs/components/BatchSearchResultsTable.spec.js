import { mount, shallowMount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import BatchSearchResultsTable from '@/components/BatchSearchResultsTable'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', {
  apiInstance: {
    getBatchSearchQueries: vi.fn(),
    getBatchSearchResults: vi.fn(),
    getBatchSearch: vi.fn(),
    copyBatchSearch: vi.fn()
  }
})

describe('BatchSearchResultsTable.vue', () => {
  const routes = [
    {
      name: 'task.batch-search.view.results',
      path: '/batch-search/:indices/:uuid'
    },
    {
      name: 'document-standalone',
      path: '/ds/:index/:id/:routing?'
    }
  ]

  const { index: project, es } = esConnectionHelper.build()
  const { index: anotherProject } = esConnectionHelper.build()
  const indices = project.concat(',', anotherProject)
  const props = { uuid: '12', indices }

  let wrapper, core

  beforeEach(async () => {
    api.getBatchSearchQueries = vi.fn()

    api.getBatchSearchResults = vi.fn().mockResolvedValue({
      items: [
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 42,
          documentNumber: 0,
          documentName: '42.pdf',
          contentType: 'type_03',
          query: 'query_01',
          project: { name: project },
          rootId: 42
        },
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 43,
          documentNumber: 1,
          documentName: '43.pdf',
          contentType: 'type_02',
          query: 'query_01',
          project: { name: anotherProject },
          rootId: 43
        },
        {
          creationDate: '2011-10-11T04:12:49.000+0000',
          documentId: 44,
          documentNumber: 2,
          documentName: '44.pdf',
          contentType: 'type_01',
          query: 'query_02',
          project: { name: anotherProject },
          rootId: 44
        }
      ],
      pagination: { total: 3 }
    })

    api.getBatchSearch = vi.fn().mockResolvedValue({
      uuid: '12',
      projects: [{ name: project }, { name: anotherProject }],
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

    api.copyBatchSearch = vi.fn()

    core = CoreSetup.init().useAll().useRouter(routes)
    core.config.merge({ mode: 'SERVER', projects: [{ name: project }, { name: anotherProject }] })
    await letData(es).have(new IndexedDocument('42', project).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('43', anotherProject).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('44', project).withContentType('type_01')).commit()
    vi.spyOn(core.router, 'push')
    wrapper = shallowMount(BatchSearchResultsTable, { props, global: { plugins: core.plugins } })
    await wrapper.vm.fetch()
  })

  afterEach(() => {
    core.store.commit('batchSearch/reset')
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
  })

  it('should display the list of the queries of this batch search', () => {
    expect(wrapper.find('.batch-search-results-table').exists()).toBeTruthy()
    expect(wrapper.find('b-table-stub').attributes('items').split(',')).toHaveLength(3)
  })

  it('should redirect on contentType changed', () => {
    vi.spyOn(core.router, 'push')

    wrapper.vm.sortChanged({ key: 'contentType', order: true })

    expect(core.router.push).toBeCalledWith({
      name: 'task.batch-search.view.results',
      params: { indices, uuid: '12' },
      query: { page: '1', sort: 'content_type', order: 'desc' }
    })
  })

  it('should return empty string if the document size is 0', () => {
    expect(wrapper.vm.getDocumentSize(undefined)).toBe('-')
  })

  it('should return the document size as human readable', () => {
    expect(wrapper.vm.getDocumentSize(42)).toBe('42.00 B')
  })

  it('should display a pagination navigation', () => {
    const find = wrapper.find('custom-pagination-stub')
    expect(find.exists()).toBeTruthy()
    expect(find.attributes('totalrows')).toBe('3')
  })

  it('should redirect to document including the search query', async () => {
    wrapper = mount(BatchSearchResultsTable, { global: { plugins: core.plugins }, props })
    await core.router
      .push({
        name: 'task.batch-search.view.results',
        params: { indices, uuid: '12' },
        query: { page: 1 }
      })
      .catch(() => {})

    await wrapper.vm.fetch()

    expect(wrapper.findAll('.batch-search-results-table__queries__query')).toHaveLength(3)
    expect(wrapper.find('.batch-search-results-table__queries__query__link').attributes('href')).toBe(
      `#/ds/${project}/42/42?q=query_01`
    )
  })

  it('should cast queries and contentTypes param into array from the url', async () => {
    wrapper = shallowMount(BatchSearchResultsTable, { global: { plugins: core.plugins }, props })
    await wrapper.vm.$router.push({
      name: 'task.batch-search.view.results',
      params: { indices, uuid: '12' },
      query: {
        queries: 'simple_text',
        contentTypes: 'type_02,type_03'
      }
    })
    expect(wrapper.vm.selectedQueries).toEqual(['simple_text'])
    expect(wrapper.vm.selectedContentTypes).toEqual(['type_02', 'type_03'])
  })

  it('should cast array params like queries into string before updating route', async () => {
    wrapper.vm.updateRoute = vi.fn()
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
