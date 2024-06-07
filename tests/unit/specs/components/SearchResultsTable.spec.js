import { mount, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

import { IndexedDocuments, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchResultsTable from '@/components/SearchResultsTable'

describe('SearchResultsTable.vue', () => {
  let index, core, wrapper
  const connectionHelper = esConnectionHelper.build()
  const api = {
    elasticsearch: connectionHelper.es,
    starDocuments: vi.fn(),
    getMappingsByFields: vi.fn(),
    getStarredDocuments: vi.fn()
  }

  beforeAll(async () => {
    index = connectionHelper.index
    core = CoreSetup.init(api).useAll().useRouter()
  })

  beforeEach(async () => {
    core.store.commit('search/index', index)
    const indexedDocuments = new IndexedDocuments().setBaseName('document').withIndex(index).count(4)
    await letData(connectionHelper.es).have(indexedDocuments).commit()
    await core.store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { global: { plugins: core.plugins, renderStubDefaultSlot: true } })
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
    wrapper = mount(SearchResultsTable, { global: { plugins: core.plugins } })
    await wrapper.setData({
      selected: [
        { id: 'document_01', index },
        { id: 'document_02', index }
      ]
    })

    wrapper.findAll('.list-group-item-action').at(1).trigger('click')

    expect(api.starDocuments).toBeCalledTimes(1)
    expect(api.starDocuments).toBeCalledWith(index, ['document_01', 'document_02'])
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
    wrapper = mount(SearchResultsTable, { global: { plugins: core.plugins } })

    await wrapper.setData({ selected: [{ id: 'document_1' }] })
    expect(wrapper.vm.selected).toHaveLength( 1)
    await wrapper.findAll('.search-results-table__actions__action').at(0).trigger('click')
    expect(wrapper.vm.selected).toHaveLength(wrapper.vm.items.length)
  })
})
