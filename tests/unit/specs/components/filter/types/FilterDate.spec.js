import { createLocalVue, mount } from '@vue/test-utils'

import FilterDate from '@/components/filter/types/FilterDate'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import filters from '@/mixins/filters'

// Mock all api calls
jest.mock('@/api')
// Mock the refreshRouteAndSearch method to avoid unnecessary route update
filters.methods.refreshRouteAndSearch = jest.fn()

describe('FilterDate.vue', () => {
  const { i18n, localVue, store, wait, router } = Core.init(createLocalVue()).useAll()
  const { index, es } = esConnectionHelper.build()
  const filter = store.getters['search/getFilter']({ name: 'indexingDate' })
  const propsData = { filter }

  let wrapper = null

  beforeEach(() => {
    store.commit('search/index', index)
    wrapper = mount(FilterDate, { i18n, localVue, router, store, wait, propsData })
  })

  afterEach(() => store.commit('search/reset'))

  it('should display a creation date filter with 2 months', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)
      .withIndexingDate('2018-04-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)
      .withIndexingDate('2018-05-01T00:00:00.000Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index)
      .withIndexingDate('2018-05-01T00:00:00.000Z')).commit()

    await wrapper.vm.root.aggregate()

    const getItem = (idx) => wrapper.findAll('.filter__items__item').at(idx).find('.custom-checkbox')
    const getItemChild = (idx, selector) => getItem(idx).find(selector)
    const getItemChildText = (idx, selector) => getItemChild(idx, selector).text()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(getItemChildText(0, '.filter__items__item__label')).toEqual('2018-05')
    expect(getItemChildText(0, '.filter__items__item__count')).toEqual('2')
    expect(getItemChildText(1, '.filter__items__item__label')).toEqual('2018-04')
    expect(getItemChildText(1, '.filter__items__item__count')).toEqual('1')
    expect(wrapper.vm.root.totalCount).toBe(3)
  })
})
