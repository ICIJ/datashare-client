import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import { Api } from '@/api'
import { Core } from '@/core'
import SearchResultsTable from '@/components/SearchResultsTable'

describe('SearchResultsTable.vue', () => {
  let i18n, localVue, store, wait, router, wrapper, api, mockAxios

  const { index, es } = esConnectionHelper.build()

  beforeAll(() => {
    router = new VueRouter()
    mockAxios = { request: jest.fn() }
    api = new Api(mockAxios, null)
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait

    store.commit('search/index', index)
  })

  beforeEach(async () => {
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({ data: {} })

    await letData(es).have(new IndexedDocuments().setBaseName('document').withIndex(index).count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { i18n, localVue, store, wait })
  })

  it('should display a b-table', () => {
    expect(wrapper.find('.search-results-table__items').exists()).toBeTruthy()
  })

  it('should display a multi selectable b-table', () => {
    expect(wrapper.find('.search-results-table__items').attributes('selectmode')).toBe('multi')
  })

  it('should display 3 action buttons', async () => {
    await wrapper.setData({
      selected: [{ id: 'document_01' }, { id: 'document_02' }]
    })

    expect(wrapper.findAll('b-list-group-stub > b-list-group-item-stub')).toHaveLength(3)
  })

  it('should set each selected document as starred', async () => {
    wrapper = mount(SearchResultsTable, { i18n, localVue, router, store, wait })
    await wrapper.setData({
      selected: [
        { id: 'document_01', index },
        { id: 'document_02', index }
      ]
    })

    wrapper.findAll('.list-group-item-action').at(1).trigger('click')

    expect(mockAxios.request).toBeCalledTimes(1)
    expect(mockAxios.request).toBeCalledWith(
      expect.objectContaining({
        url: Api.getFullUrl('/api/' + index + '/documents/batchUpdate/star'),
        method: 'POST',
        data: ['document_01', 'document_02']
      })
    )
  })

  it('should translate an unknown size', () => {
    const size = wrapper.vm.humanSize('')

    expect(size).toBe('Unknown')
  })

  it('should display a humanSize', () => {
    const size = wrapper.vm.humanSize(12345678)

    expect(size).toBe('11.77 MB')
  })

  it('should select all documents', async () => {
    mockAxios.request.mockResolvedValue({
      data: [{ id: 'document_01' }, { id: 'document_03' }, { id: 'document_03' }, { id: 'document_04' }]
    })
    wrapper = mount(SearchResultsTable, { i18n, localVue, router, store, wait })
    await wrapper.setData({ selected: [{ id: 'document_01' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selected).toHaveLength(1)

    await wrapper.findAll('.list-group-item-action').at(0).trigger('click')

    expect(wrapper.vm.selected).toHaveLength(4)
  })
})
