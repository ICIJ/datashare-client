import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import axios from 'axios'
import VueRouter from 'vue-router'

import Api from '@/api'
import SearchResultsTable from '@/components/SearchResultsTable'
import { Core } from '@/core'
import { IndexedDocuments, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('SearchResultsTable.vue', () => {
  const project = toLower('SearchResultsTable')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    jest.unmock('axios')
    store.commit('search/index', project)
  })

  beforeEach(async () => {
    await letData(es).have(new IndexedDocuments()
      .setBaseName('document')
      .withIndex(project)
      .count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { i18n, localVue, store })
  })

  afterAll(() => jest.unmock('axios'))

  it('should display a b-table', () => {
    expect(wrapper.find('.search-results-table__items').exists()).toBeTruthy()
  })

  it('should display a multi selectable b-table', () => {
    expect(wrapper.find('.search-results-table__items').attributes('selectmode')).toBe('multi')
  })

  it('should display 3 action buttons', async () => {
    await wrapper.vm.$set(wrapper.vm, 'selected', [{ id: 'document_01' }, { id: 'document_02' }])

    expect(wrapper.findAll('b-list-group-stub > b-list-group-item-stub')).toHaveLength(3)
  })

  it('should set each selected document as starred', async () => {
    wrapper = mount(SearchResultsTable, { i18n, localVue, store, router })
    await wrapper.vm.$set(wrapper.vm, 'selected', [{ id: 'document_01' }, { id: 'document_02' }])

    wrapper.findAll('.list-group-item-action').at(1).trigger('click')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/' + project + '/documents/batchUpdate/star'),
      method: 'POST',
      data: ['document_01', 'document_02']
    }))
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
    axios.request.mockResolvedValue({ data: [{ id: 'document_01' }, { id: 'document_03' }, { id: 'document_03' }, { id: 'document_04' }] })
    wrapper = mount(SearchResultsTable, { i18n, localVue, store, router })
    await wrapper.vm.$set(wrapper.vm, 'selected', [{ id: 'document_01' }])
    await wrapper.vm.$nextTick()

    await wrapper.findAll('.list-group-item-action').at(0).trigger('click')

    expect(wrapper.vm.selected).toHaveLength(4)
  })
})
