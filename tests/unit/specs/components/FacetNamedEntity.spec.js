import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { EventBus } from '@/utils/event-bus'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import mixin from '@/mixins/facets'
import find from 'lodash/find'
import noop from 'lodash/noop'

jest.mock('@/api/DatashareClient', () => {
  const { jsonOk } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteNamedEntitiesByMentionNorm: jest.fn().mockReturnValue(jsonOk({})),
      getStarredDocuments: jest.fn().mockReturnValue(jsonOk({}))
    }
  })
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetNamedEntity.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    mixin.methods.watchedForUpdate = noop
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    wrapper = mount(FacetNamedEntity, { localVue, i18n, store, propsData: { facet: find(store.state.search.facets, { name: 'named-entity-person' }) } })
    store.commit('search/setGlobalSearch', false)
  })

  afterEach(() => store.commit('search/reset'))

  afterAll(() => jest.unmock('@/api/DatashareClient'))

  it('should display empty list', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(0)
  })

  it('should display 1 named entity', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__count').at(0).attributes('data-original-title')).toEqual('one occurrence in one doc')
  })

  it('should display 2 named entities in one document', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')
      .withNer('person_02')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
  })

  it('should display 1 named entity in 2 documents', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01', 2)
      .withNer('person_01', 25)).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_01')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__count').at(0).attributes('data-original-title')).toEqual('3 occurrences in 2 docs')
  })

  it('should display 3 named entities in 2 documents in correct order', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01', 2)).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02', 2)
      .withNer('person_02', 16)
      .withNer('person_02', 21)
      .withNer('person_01', 26)
      .withNer('person_03', 35)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(0).text()).toEqual('person_01')
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(1).text()).toEqual('person_02')
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(2).text()).toEqual('person_03')
  })

  it('should not display the "Show more" button', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01', 2)).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02', 2)
      .withNer('person_02', 16)
      .withNer('person_02', 21)
      .withNer('person_01', 26)
      .withNer('person_03', 35)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display span')).toHaveLength(0)
  })

  it('should display the "Show more" button (1/2)', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01', 2)).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02', 2)
      .withNer('person_02', 16)
      .withNer('person_02', 21)
      .withNer('person_01', 26)
      .withNer('person_03', 35)
      .withNer('person_04', 42)
      .withNer('person_05', 42)
      .withNer('person_06', 42)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
  })

  it('should display the "Show more" button (2/2)', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01', 2)).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02', 2)
      .withNer('person_02', 16)
      .withNer('person_02', 21)
      .withNer('person_01', 26)
      .withNer('person_03', 35)
      .withNer('person_04', 42)
      .withNer('person_05', 42)
      .withNer('person_06', 42)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
  })

  it('should filter on named entity facet and return no items', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_03')).commit()
    await letData(es).have(new IndexedDocument('doc_04')
      .withNer('person_04')).commit()

    wrapper.vm.root.facetQuery = 'Windows'
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(0)
  })

  it('should filter on named entity facet and return all items', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_03')).commit()
    await letData(es).have(new IndexedDocument('doc_04')
      .withNer('person_04')).commit()

    wrapper.vm.root.facetQuery = 'person'
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(4)
  })

  it('should filter on named entity facet and return only 1 item', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_03')).commit()
    await letData(es).have(new IndexedDocument('doc_04')
      .withNer('person_04')).commit()

    wrapper.vm.root.facetQuery = 'person_01'
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
  })

  describe('Deletion', () => {
    it('should display the dropdown menu', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withNer('person_01')).commit()

      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.facet__items__item .facet__items__item__menu')).toHaveLength(1)
      expect(wrapper.findAll('.facet__items__item .facet__items__item__menu .dropdown-item')).toHaveLength(1)
    })

    it('should emit a facet::hide::named-entities event on click to delete named entity', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withNer('person_01')).commit()

      await wrapper.vm.root.aggregate()
      const mockCallback = jest.fn()
      EventBus.$on('facet::hide::named-entities', mockCallback)

      await wrapper.find('.facet__items__item .facet__items__item__menu .dropdown-item:first-child').trigger('click')

      expect(mockCallback.mock.calls).toHaveLength(1)
    })

    it('should call the aggregate function after a named entity deletion', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withNer('person_01')).commit()

      await wrapper.vm.root.aggregate()
      const spyAggregate = jest.spyOn(wrapper.vm.root, 'aggregate')
      expect(spyAggregate).not.toBeCalled()

      await wrapper.find('.facet__items__item .facet__items__item__menu .dropdown-item:first-child').trigger('click')

      expect(spyAggregate).toBeCalled()
      expect(spyAggregate).toBeCalledTimes(1)
    })
  })

  it('should filter items according to the content type facet search', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('type_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('type_02')
      .withNer('person_02')).commit()

    const contentTypeFacet = find(store.state.search.facets, { name: 'content-type' })
    contentTypeFacet.value = ['type_01']
    store.commit('search/addFacetValue', contentTypeFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
  })

  it('should filter items according to the path facet search', async () => {
    await letData(es).have(new IndexedDocument('/a/doc_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('/b/doc_02')
      .withNer('person_02')).commit()

    const pathFacet = find(store.state.search.facets, { name: 'path' })
    pathFacet.value = ['/a']
    store.commit('search/addFacetValue', pathFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
  })

  it('should filter items according to the date facet search', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')
      .withIndexingDate('2018-10-19T10:11:12.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02')
      .withIndexingDate('2018-09-19T10:11:12.001Z')).commit()

    const dateFacet = find(store.state.search.facets, { name: 'indexing-date' })
    dateFacet.value = [new Date('2018-09-01T00:00:00.000Z').getTime().toString()]
    store.commit('search/addFacetValue', dateFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
  })

  it('should filter items according to the content type reverse facet search', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('type_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('type_02')
      .withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContentType('type_03')
      .withNer('person_03')).commit()

    const contentTypeFacet = find(store.state.search.facets, { name: 'content-type' })
    contentTypeFacet.value = ['type_01']
    store.commit('search/addFacetValue', contentTypeFacet)
    store.commit('search/toggleFacet', 'content-type')
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(0).text()).toContain('person_02')
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(1).text()).toContain('person_03')
  })

  it('should display the named entities containing the query string, and those linked to documents containing the query string', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContent('person_01')
      .withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_03')).commit()

    store.commit('search/query', 'person_01')
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(0).text()).toContain('person_01')
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(1).text()).toContain('person_02')
  })

  it('should filter items according to the named entity facet search', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_03')).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item').at(0).text()).toContain('person_01')
  })

  it('should display the only named-entity-person selected', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')
      .withNer('person_02')
      .withNer('person_03')
      .withNer('organization_01', 1, 'ORGANIZATION')
      .withNer('organization_02', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_03')
      .withNer('organization_03', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_02')
      .withNer('person_04')
      .withNer('organization_02', 1, 'ORGANIZATION')
      .withNer('organization_03', 1, 'ORGANIZATION')
      .withNer('organization_04', 1, 'ORGANIZATION')
    ).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_02']
    store.commit('search/addFacetValue', namedEntityFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item').at(0).text()).toContain('person_02')
  })

  it('should filter items of named-entity-person according to the named-entity-organization selected', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')
      .withNer('person_02')
      .withNer('person_03')
      .withNer('organization_01', 1, 'ORGANIZATION')
      .withNer('organization_02', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_03')
      .withNer('organization_03', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withNer('person_02')
      .withNer('person_04')
      .withNer('organization_02', 1, 'ORGANIZATION')
      .withNer('organization_03', 1, 'ORGANIZATION')
      .withNer('organization_04', 1, 'ORGANIZATION')
    ).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-organization' })
    namedEntityFacet.value = ['organization_03']
    store.commit('search/addFacetValue', namedEntityFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    expect(wrapper.findAll('.facet__items__item').at(0).text()).toContain('person_02')
    expect(wrapper.findAll('.facet__items__item').at(1).text()).toContain('person_03')
    expect(wrapper.findAll('.facet__items__item').at(2).text()).toContain('person_04')
  })

  it('should prepend a selected and inverted Named Entity in the items, and show it in the list of facet items', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withNer('anne')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withNer('bruno')).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['anne']
    store.commit('search/addFacetValue', namedEntityFacet)
    store.commit('search/toggleFacet', 'named-entity-person')
    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.facet__items__item').at(0).find('.facet__items__item__body__key').text()).toBe('anne')
    expect(wrapper.findAll('.facet__items__item').at(1).find('.facet__items__item__body__key').text()).toBe('bruno')
  })

  it('should filter facets items on 2 named entities from different categories', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')
      .withNer('person_02')
      .withNer('organization_01', 1, 'ORGANIZATION')
      .withNer('organization_02', 1, 'ORGANIZATION')
      .withNer('location_01', 1, 'LOCATION')
      .withNer('location_02', 1, 'LOCATION')
    ).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-organization' })
    namedEntityFacet.value = ['organization_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
  })

  it('should display the correct number of occurrences if named entity facet is inverted', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')
      .withNer('organization_01', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withNer('person_01')
      .withNer('organization_02', 1, 'ORGANIZATION')
    ).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-organization' })
    namedEntityFacet.value = ['organization_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    store.commit('search/toggleFacet', 'named-entity-organization')
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__count').at(0).attributes('data-original-title')).toContain('one occurrence in one doc')
  })

  it('should display an "All" item on top of others items, and this item should be active by default', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContent('person_01')
      .withNer('person_01')).commit()

    await wrapper.vm.root.aggregate()
    await store.dispatch('search/query', '*')

    expect(wrapper.findAll('.facet__items__all')).toHaveLength(1)
    expect(wrapper.find('.facet__items__all .custom-control-input').element.checked).toBeTruthy()
    expect(wrapper.findAll('.facet__items__all .facet__items__item__body__key').at(0).text()).toEqual('All')
  })

  it('should load and checked the facet values stored in store', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    wrapper = mount(FacetNamedEntity, { localVue, i18n, store, propsData: { facet: find(store.state.search.facets, { name: 'named-entity-person' }) } })
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__body__key').at(0).text()).toEqual('person_01')
    expect(wrapper.findAll('.facet__items__item input').at(0).element.checked).toBeTruthy()
  })

  it('should select the "All" item by default if nothing is selected', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withNer('person_01')).commit()

    const namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    wrapper = mount(FacetNamedEntity, { localVue, i18n, store, router, propsData: { facet: find(store.state.search.facets, { name: 'named-entity-person' }) } })
    await wrapper.vm.root.aggregate()
    wrapper.findAll('.facet__items__item .facet__items__item__checkbox input').at(0).trigger('click')

    expect(wrapper.findAll('.facet__items__all input').at(0).element.checked).toBeTruthy()
  })
})
