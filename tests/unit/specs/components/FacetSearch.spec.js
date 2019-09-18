import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import FacetSearch from '@/components/FacetSearch'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import find from 'lodash/find'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteNamedEntitiesByMentionNorm: jest.fn().mockReturnValue(jsonOk())
    }
  })
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetSearch.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    store.commit('search/reset')
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    const facet = find(store.state.search.facets, { name: 'content-type' })
    wrapper = mount(FacetSearch, { localVue, i18n, store, router, propsData: { infiniteScroll: false, throttle: 0, facet } })
  })

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  describe('pagination', () => {
    it('should display 2 items', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withContentType('type_02')).commit()

      await wrapper.vm.startOver()

      expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    })

    it('should paginate 4 items on 2 pages', async () => {
      wrapper.vm.pageSize = 2
      await letData(es).have(new IndexedDocument('doc_01')
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03')
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04')
        .withContentType('type_04')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)

      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(4)
    })

    it('should paginate 10 items on 10 pages', async () => {
      wrapper.vm.pageSize = 1
      await letData(es).have(new IndexedDocument('doc_01')
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03')
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04')
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05')
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06')
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07')
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08')
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09')
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10')
        .withContentType('type_10')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(4)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(5)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(6)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(7)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(8)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(9)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(10)
    })

    it('should paginate 10 items on 2 pages, and start over', async () => {
      wrapper.vm.pageSize = 5
      await letData(es).have(new IndexedDocument('doc_01')
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03')
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04')
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05')
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06')
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07')
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08')
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09')
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10')
        .withContentType('type_10')).commit()

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(5)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(10)

      await wrapper.vm.startOver()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(5)
      await wrapper.vm.next()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(10)
    })
  })

  describe('search', () => {
    it('should create query tokens', async () => {
      wrapper.setData({ facetQuery: 'ICIJ' })
      await wrapper.vm.startOver()

      expect(wrapper.vm.queryTokens).toContain('icij')
    })

    it('should filter the list according to facetQuery', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withContentType('type_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03')
        .withContentType('type_03')).commit()
      await letData(es).have(new IndexedDocument('doc_04')
        .withContentType('type_04')).commit()
      await letData(es).have(new IndexedDocument('doc_05')
        .withContentType('type_05')).commit()
      await letData(es).have(new IndexedDocument('doc_06')
        .withContentType('type_06')).commit()
      await letData(es).have(new IndexedDocument('doc_07')
        .withContentType('type_07')).commit()
      await letData(es).have(new IndexedDocument('doc_08')
        .withContentType('type_08')).commit()
      await letData(es).have(new IndexedDocument('doc_09')
        .withContentType('type_09')).commit()
      await letData(es).have(new IndexedDocument('doc_10')
        .withContentType('type_10')).commit()

      wrapper.setData({ facetQuery: '' })
      await wrapper.vm.startOver()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(8)

      wrapper.setData({ facetQuery: 'type_1' })
      await wrapper.vm.startOver()
      expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    })

    it('should trigger a search when value of facetQuery changes', () => {
      jest.spyOn(wrapper.vm, 'search').mockImplementation(jest.fn)
      expect(wrapper.vm.search).not.toHaveBeenCalled()

      wrapper.setData({ facetQuery: 'pdf' })
      expect(wrapper.vm.search).toHaveBeenCalled()
    })
  })

  describe('spinner', () => {
    it('should display a "No results" message if so"', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withContentType('type_02')).commit()
      await wrapper.vm.startOver()

      expect(wrapper.findAll('.facet-search > div.text-muted').isVisible()).toBeFalsy()

      wrapper.setData({ facetQuery: 'not_existing_type' })
      await wrapper.vm.search({ complete: jest.fn, loaded: jest.fn })

      expect(wrapper.findAll('.facet-search > div.text-muted').isVisible()).toBeTruthy()
    })
  })

  it('should display all the indexing dates', async () => {
    wrapper = mount(FacetSearch, { localVue, i18n, store, router, propsData: { infiniteScroll: false, throttle: 0, facet: find(store.state.search.facets, { name: 'indexing-date' }) } })
    await letData(es).have(new IndexedDocument('doc_01.txt').withIndexingDate('2018-01-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withIndexingDate('2018-02-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withIndexingDate('2018-03-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withIndexingDate('2018-04-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withIndexingDate('2018-05-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_06.txt').withIndexingDate('2018-06-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_07.txt').withIndexingDate('2018-07-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_08.txt').withIndexingDate('2018-08-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_09.txt').withIndexingDate('2018-09-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_10.txt').withIndexingDate('2018-10-01T00:00:00.001Z')).commit()
    await wrapper.vm.startOver()
    await wrapper.vm.next()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(10)
  })

  it('should display the total count of content type', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('type_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContentType('type_03')).commit()

    await wrapper.vm.startOver()

    expect(wrapper.findAll('.facet-search .facet__items__all')).toHaveLength(1)
    expect(wrapper.find('.facet-search .facet__items__all .facet__items__item__label').text()).toBe('All')
    expect(wrapper.find('.facet-search .facet__items__all .facet__items__item__count').text()).toBe('3')
  })

  it('should emit an event "facet::search::add-facet-values" on adding facet values', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::search::add-facet-values', mockCallback)

    wrapper.vm.onAddedFacetValues()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should filter facet values on facet label', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContentType('message/rfc822')).commit()
    wrapper.vm.facetQuery = 'Internet'

    await wrapper.vm.search()

    expect(wrapper.vm.items).toHaveLength(1)
    expect(wrapper.vm.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.totalCount).toEqual(2)
  })

  it('should filter facet values on facet label in capital letters', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContentType('message/rfc822')).commit()
    wrapper.vm.facetQuery = 'EMAIL'

    await wrapper.vm.search()

    expect(wrapper.vm.items).toHaveLength(1)
    expect(wrapper.vm.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.totalCount).toEqual(2)
  })
})
