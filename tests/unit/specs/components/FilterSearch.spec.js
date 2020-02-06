import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'

import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FilterSearch from '@/components/FilterSearch'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

jest.mock('@/api', () => {
  const { jsonResp } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteNamedEntitiesByMentionNorm: jest.fn().mockReturnValue(jsonResp())
    }
  })
})

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('FilterSearch.vue', () => {
  const index = toLower('FilterSearch')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    store.commit('search/reset')
    store.commit('search/index', index)
    const filter = find(store.getters['search/instantiatedFilters'], { name: 'contentType' })
    wrapper = mount(FilterSearch,
      { localVue, store, propsData: { infiniteScroll: false, throttle: 0, filter }, mocks: { $t: msg => msg, $te: msg => msg, $n: msg => msg } })
  })

  afterAll(() => jest.unmock('@/api'))

  describe('pagination', () => {
    it('should display 2 items', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withContentType('type_02')).commit()

      await wrapper.vm.startOver()

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    })

    it('should paginate 4 items on 2 pages', async () => {
      wrapper.vm.pageSize = 2
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', index)
        .withContentType('type_04')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)

      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(4)
    })

    it('should paginate 10 items on 10 pages', async () => {
      wrapper.vm.pageSize = 1
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', index)
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05', index)
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06', index)
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07', index)
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08', index)
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09', index)
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10', index)
        .withContentType('type_10')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(4)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(5)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(6)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(7)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(8)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(9)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(10)
    })

    it('should paginate 10 items on 2 pages, and start over', async () => {
      wrapper.vm.pageSize = 5
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', index)
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05', index)
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06', index)
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07', index)
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08', index)
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09', index)
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10', index)
        .withContentType('type_10')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(5)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(10)

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(5)
      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(10)
    })
  })

  describe('search', () => {
    it('should create query tokens', async () => {
      wrapper.setData({ filterQuery: 'ICIJ' })
      await wrapper.vm.startOver()

      expect(wrapper.vm.queryTokens).toContain('icij')
    })

    it('should filter the list according to filterQuery', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', index)
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05', index)
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06', index)
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07', index)
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08', index)
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09', index)
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10', index)
        .withContentType('type_10')).commit()

      wrapper.setData({ filterQuery: '' })
      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(8)

      wrapper.setData({ filterQuery: 'type_1' })
      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    })

    it('should trigger a search when value of filterQuery changes', () => {
      jest.spyOn(wrapper.vm, 'search').mockImplementation(jest.fn)
      expect(wrapper.vm.search).not.toHaveBeenCalled()

      wrapper.setData({ filterQuery: 'pdf' })
      expect(wrapper.vm.search).toHaveBeenCalled()
    })
  })

  describe('spinner', () => {
    it('should display a "No results" message if so"', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index)
        .withContentType('type_02')).commit()
      await wrapper.vm.startOver()

      expect(wrapper.findAll('.filter-search > div.text-muted').isVisible()).toBeFalsy()

      wrapper.setData({ filterQuery: 'not_existing_type' })
      await wrapper.vm.search({ complete: jest.fn, loaded: jest.fn })

      expect(wrapper.findAll('.filter-search > div.text-muted').isVisible()).toBeTruthy()
    })
  })

  it('should display all the indexing dates', async () => {
    wrapper = mount(FilterSearch,
      { localVue, store, propsData: { infiniteScroll: false, throttle: 0, filter: find(store.getters['search/instantiatedFilters'], { name: 'indexingDate' }) }, mocks: { $t: msg => msg, $te: msg => msg, $n: msg => msg } })
    await letData(es).have(new IndexedDocument('doc_01', index)
      .withIndexingDate('2018-01-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)
      .withIndexingDate('2018-02-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index)
      .withIndexingDate('2018-03-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_04', index)
      .withIndexingDate('2018-04-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_05', index)
      .withIndexingDate('2018-05-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_06', index)
      .withIndexingDate('2018-06-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_07', index)
      .withIndexingDate('2018-07-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_08', index)
      .withIndexingDate('2018-08-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_09', index)
      .withIndexingDate('2018-09-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_10', index)
      .withIndexingDate('2018-10-01T00:00:00.001Z')).commit()
    await wrapper.vm.startOver()
    await wrapper.vm.next()

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(10)
  })

  it('should display the total count of content type', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)
      .withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)
      .withContentType('type_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index)
      .withContentType('type_03')).commit()

    await wrapper.vm.startOver()

    expect(wrapper.findAll('.filter-search .filter__items__all')).toHaveLength(1)
    expect(wrapper.find('.filter-search .filter__items__all .filter__items__item__label').text()).toBe('all')
    expect(wrapper.find('.filter-search .filter__items__all .filter__items__item__count').text()).toBe('3')
  })

  it('should emit an event "filter::search::add-filter-values" on adding filter values', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::search::add-filter-values', mockCallback)

    wrapper.vm.onAddedFilterValues()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should filter filter values on filter label', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index)
      .withContentType('message/rfc822')).commit()
    wrapper.vm.filterQuery = 'Internet'

    await wrapper.vm.search()

    expect(wrapper.vm.items).toHaveLength(1)
    expect(wrapper.vm.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.total).toEqual(3)
  })

  it('should filter filter values on filter label in capital letters', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index)
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index)
      .withContentType('message/rfc822')).commit()
    wrapper.vm.filterQuery = 'EMAIL'

    await wrapper.vm.search()

    expect(wrapper.vm.items).toHaveLength(1)
    expect(wrapper.vm.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.total).toEqual(3)
  })
})
