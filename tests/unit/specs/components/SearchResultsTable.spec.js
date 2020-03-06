import axios from 'axios'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
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
  const index = toLower('SearchResultsTable')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(async () => {
    await letData(es).have(new IndexedDocuments()
      .setBaseName('document')
      .withIndex(index)
      .count(4)).commit()
    await store.dispatch('search/query', { query: '*', from: 0, size: 25 })
    wrapper = shallowMount(SearchResultsTable, { i18n, localVue, store })
  })

  it('should display a b-table', () => {
    expect(wrapper.find('.search-results-table__items').exists()).toBeTruthy()
  })

  it('should display a multi selectable b-table', () => {
    expect(wrapper.find('.search-results-table__items').attributes('selectmode')).toBe('multi')
  })

  it('should display 2 action buttons', async () => {
    await wrapper.vm.$set(wrapper.vm, 'selected', [{ id: 'document_01' }, { id: 'document_02' }])

    expect(wrapper.findAll('b-list-group-stub > b-list-group-item-stub')).toHaveLength(2)
  })

  it('should set each selected document as starred', async () => {
    wrapper = mount(SearchResultsTable, { i18n, localVue, store, router })
    await wrapper.vm.$set(wrapper.vm, 'selected', [{ id: 'document_01' }, { id: 'document_02' }])

    wrapper.findAll('.list-group-item-action').at(0).trigger('click')

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl('/api/' + index + '/documents/batchUpdate/star'),
      method: 'POST',
      data: ['document_01', 'document_02']
    }))
  })
})
