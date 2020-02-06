import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'

import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FilterDate from '@/components/FilterDate'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

const { localVue, i18n, store } = App.init(createLocalVue()).useAll()

describe('FilterDate.vue', () => {
  const index = toLower('FilterDate')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', index)
    wrapper = mount(FilterDate, { localVue, i18n, store, propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'indexingDate' }) } })
  })

  afterEach(() => store.commit('search/reset'))

  it('should display an creation date filter with 2 months', async () => {
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
    expect(wrapper.vm.root.totalCount).toEqual(3)
  })
})
