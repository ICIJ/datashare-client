import find from 'lodash/find'
import toLower from 'lodash/toLower'
import '@testing-library/jest-dom'
import { createLocalVue, mount } from '@vue/test-utils'

import FilterSearch from '@/components/FilterSearch'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/api', () => {
  const { jsonResp } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteNamedEntitiesByMentionNorm: jest.fn().mockReturnValue(jsonResp())
    }
  })
})

describe('FilterSearch.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const project = toLower('FilterSearch')
  esConnectionHelper(project)
  const es = esConnectionHelper.es
  let wrapper = null

  beforeEach(() => {
    store.commit('search/reset')
    store.commit('search/index', project)
    const filter = find(store.getters['search/instantiatedFilters'], { name: 'contentType' })
    wrapper = mount(FilterSearch,
      { i18n, localVue, store, wait, propsData: { infiniteScroll: false, throttle: 0, filter } })
  })

  afterAll(() => jest.unmock('@/api'))

  describe('pagination', () => {
    it('should display 2 items', async () => {
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withContentType('type_02')).commit()

      await wrapper.vm.startOver()

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    })

    it('should paginate 4 items on 2 pages', async () => {
      wrapper.vm.pageSize = 2
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', project)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', project)
        .withContentType('type_04')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)

      await wrapper.vm.next()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(4)
    })

    it('should paginate 10 items on 10 pages', async () => {
      wrapper.vm.pageSize = 1
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', project)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', project)
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05', project)
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06', project)
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07', project)
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08', project)
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09', project)
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10', project)
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
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', project)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', project)
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05', project)
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06', project)
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07', project)
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08', project)
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09', project)
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10', project)
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
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03', project)
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04', project)
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05', project)
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06', project)
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07', project)
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08', project)
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09', project)
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10', project)
        .withContentType('type_10')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(8)

      wrapper.setData({ filterQuery: 'type_1' })
      await wrapper.vm.startOver()
      expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    })

    it('should trigger a search when value of filterQuery changes', async () => {
      jest.spyOn(wrapper.vm, 'search').mockImplementation(jest.fn)
      expect(wrapper.vm.search).not.toHaveBeenCalled()

      await wrapper.setData({ filterQuery: 'pdf' })
      expect(wrapper.vm.search).toHaveBeenCalled()
    })

    it('should be able to search into a not string filter', async () => {
      wrapper.setProps({ filter: find(store.getters['search/instantiatedFilters'], { name: 'extractionLevel' }) })
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withExtractionLevel(0)).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withExtractionLevel(1)).commit()
      await letData(es).have(new IndexedDocument('doc_03', project)
        .withExtractionLevel(2)).commit()
      await letData(es).have(new IndexedDocument('doc_04', project)
        .withExtractionLevel(3)).commit()
      await letData(es).have(new IndexedDocument('doc_05', project)
        .withExtractionLevel(4)).commit()
      await letData(es).have(new IndexedDocument('doc_06', project)
        .withExtractionLevel(5)).commit()
      await letData(es).have(new IndexedDocument('doc_07', project)
        .withExtractionLevel(6)).commit()
      await letData(es).have(new IndexedDocument('doc_08', project)
        .withExtractionLevel(7)).commit()
      await letData(es).have(new IndexedDocument('doc_09', project)
        .withExtractionLevel(8)).commit()
      await letData(es).have(new IndexedDocument('doc_10', project)
        .withExtractionLevel(9)).commit()

      await wrapper.vm.startOver()

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(8)
    })
  })

  describe('spinner', () => {
    it('should display a "No results" message if so"', async () => {
      await letData(es).have(new IndexedDocument('doc_01', project)
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02', project)
        .withContentType('type_02')).commit()
      await wrapper.vm.startOver()

      expect(wrapper.find('.filter-search > div.text-muted').element).not.toBeVisible()

      wrapper.setData({ filterQuery: 'not_existing_type' })
      await wrapper.vm.search({ complete: jest.fn, loaded: jest.fn })

      expect(wrapper.find('.filter-search > div.text-muted').element).toBeVisible()
    })
  })

  it('should display all the indexing dates', async () => {
    wrapper.setProps({ filter: find(store.getters['search/instantiatedFilters'], { name: 'indexingDate' }) })
    await letData(es).have(new IndexedDocument('doc_01', project)
      .withIndexingDate('2018-01-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project)
      .withIndexingDate('2018-02-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project)
      .withIndexingDate('2018-03-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_04', project)
      .withIndexingDate('2018-04-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_05', project)
      .withIndexingDate('2018-05-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_06', project)
      .withIndexingDate('2018-06-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_07', project)
      .withIndexingDate('2018-07-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_08', project)
      .withIndexingDate('2018-08-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_09', project)
      .withIndexingDate('2018-09-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_10', project)
      .withIndexingDate('2018-10-01T00:00:00.001Z')).commit()

    await wrapper.vm.startOver()
    await wrapper.vm.next()

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(10)
  })

  it('should display the total count of content type', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project)
      .withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project)
      .withContentType('type_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project)
      .withContentType('type_03')).commit()

    await wrapper.vm.startOver()

    expect(wrapper.findAll('.filter-search .filter__items__all')).toHaveLength(1)
    expect(wrapper.find('.filter-search .filter__items__all .filter__items__item__label').text()).toBe('All')
    expect(wrapper.find('.filter-search .filter__items__all .filter__items__item__count').text()).toBe('3')
  })

  it('should emit an event "filter::search::add-filter-values" on adding filter values', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('filter::search::add-filter-values', mockCallback)

    wrapper.vm.onAddedFilterValues()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should filter values on their label - not case sensitive', async () => {
    await letData(es).have(new IndexedDocument('doc_01', project)
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02', project)
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03', project)
      .withContentType('message/rfc822')).commit()

    wrapper.vm.filterQuery = 'internet'
    await wrapper.vm.search()

    expect(wrapper.vm.items).toHaveLength(1)
    expect(wrapper.vm.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.total).toEqual(3)

    wrapper.vm.filterQuery = 'INTERNET'
    await wrapper.vm.search()

    expect(wrapper.vm.items).toHaveLength(1)
    expect(wrapper.vm.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.total).toEqual(3)
  })

  describe('search bar', () => {
    it('should be displayed', () => {
      expect(wrapper.find('.filter-search__form').exists()).toBeTruthy()
    })

    it('should NOT be displayed if filter is not searchable', async () => {
      wrapper.setProps({ filter: find(store.getters['search/instantiatedFilters'], { name: 'extractionLevel' }) })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.filter-search__form').exists()).toBeFalsy()
    })
  })
})
