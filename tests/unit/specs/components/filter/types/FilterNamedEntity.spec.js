import { noop } from 'lodash'
import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import mixin from '@/mixins/filters'
import FilterNamedEntity from '@/components/filter/types/FilterNamedEntity'
import { jsonResp } from '~tests/unit/tests_utils'

// Mock the refreshRouteAndSearch method to avoid unnecessary route update
mixin.methods.refreshRouteAndSearch = vi.fn()

describe('FilterNamedEntity.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = 'document'
  const name = 'namedEntityPerson'
  let api, wrapper, core

  beforeEach(() => {
    api = {
      fetchIndicesStarredDocuments: vi.fn().mockReturnValue(jsonResp()),
      elasticsearch: es
    }

    core = CoreSetup.init(api).useAll().useRouter()
    core.config.set('manageDocuments', true)
    core.store.commit('search/index', index)
    core.store.commit('search/reset')
    core.store.commit('search/contextualizeFilter', name)
    mixin.methods.watchedForUpdate = noop

    const filter = core.store.getters['search/getFilter']({ name })
    const props = { filter, infiniteScroll: false }

    wrapper = mount(FilterNamedEntity, { global: { plugins: core.plugins }, props })
  })

  afterEach(() => {
    api.fetchIndicesStarredDocuments.mockClear()
  })

  it('should filter items according to the content type filter search', async () => {
    await letData(es)
      .have(new IndexedDocument('document_01', index).withContentType('type_01').withNer('person_01'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withContentType('type_02').withNer('person_02'))
      .commit()

    core.store.commit('search/setFilterValue', { name: 'contentType', value: 'type_01' })
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
  })

  it('should filter items according to the date filter search', async () => {
    await letData(es)
      .have(new IndexedDocument('document_01', index).withNer('person_01').withIndexingDate('2018-10-19T10:11:12.001Z'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withNer('person_02').withIndexingDate('2018-09-19T10:11:12.001Z'))
      .commit()

    const value = [new Date('2018-09-01T00:00:00.000Z').getTime().toString()]
    core.store.commit('search/setFilterValue', { name: 'indexingDate', value })
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
  })

  it('should filter items according to the content type reverse filter search', async () => {
    await letData(es)
      .have(new IndexedDocument('document_01', index).withContentType('type_01').withNer('person_01'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withContentType('type_02').withNer('person_02'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_03', index).withContentType('type_03').withNer('person_03'))
      .commit()

    core.store.commit('search/setFilterValue', { name: 'contentType', value: ['type_01'] })
    core.store.commit('search/toggleFilter', 'contentType')
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toContain('person_02')
    expect(wrapper.findAll('.filter__items__item__label').at(2).text()).toContain('person_03')
  })

  it('should filter items according to the named entity filter search', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withNer('person_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withNer('person_03')).commit()

    core.store.commit('search/setFilterValue', { name: 'namedEntityPerson', value: ['person_01'] })
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.filter__items__item').at(0).text()).toContain('person_01')
  })

  it('should display the only namedEntityPerson selected', async () => {
    await letData(es)
      .have(
        new IndexedDocument('doc_01', index)
          .withNer('person_01')
          .withNer('person_02')
          .withNer('person_03')
          .withNer('organization_01', 1, 'ORGANIZATION')
          .withNer('organization_02', 1, 'ORGANIZATION')
      )
      .commit()
    await letData(es)
      .have(new IndexedDocument('doc_02', index).withNer('person_03').withNer('organization_03', 1, 'ORGANIZATION'))
      .commit()
    await letData(es)
      .have(
        new IndexedDocument('doc_03', index)
          .withNer('person_02')
          .withNer('person_04')
          .withNer('organization_02', 1, 'ORGANIZATION')
          .withNer('organization_03', 1, 'ORGANIZATION')
          .withNer('organization_04', 1, 'ORGANIZATION')
      )
      .commit()

    core.store.commit('search/setFilterValue', { name: 'namedEntityPerson', value: ['person_02'] })
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.filter__items__item').at(0).text()).toContain('person_02')
  })

  it('should filter items of namedEntityPerson according to the namedEntityOrganization selected', async () => {
    await letData(es)
      .have(
        new IndexedDocument('doc_01', index)
          .withNer('person_01')
          .withNer('person_02')
          .withNer('person_03')
          .withNer('organization_01', 1, 'ORGANIZATION')
          .withNer('organization_02', 1, 'ORGANIZATION')
      )
      .commit()
    await letData(es)
      .have(new IndexedDocument('doc_02', index).withNer('person_03').withNer('organization_03', 1, 'ORGANIZATION'))
      .commit()
    await letData(es)
      .have(
        new IndexedDocument('doc_03', index)
          .withNer('person_02')
          .withNer('person_04')
          .withNer('organization_02', 1, 'ORGANIZATION')
          .withNer('organization_03', 1, 'ORGANIZATION')
          .withNer('organization_04', 1, 'ORGANIZATION')
      )
      .commit()

    core.store.commit('search/setFilterValue', { name: 'namedEntityOrganization', value: ['organization_03'] })
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)
    expect(wrapper.findAll('.filter__items__item').at(0).text()).toContain('person_02')
    expect(wrapper.findAll('.filter__items__item').at(1).text()).toContain('person_03')
    expect(wrapper.findAll('.filter__items__item').at(2).text()).toContain('person_04')
  })

  it('should prepend a selected and excluded Named Entity in the items, and show it in the list of filter items', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withNer('anne')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withNer('bruno')).commit()

    core.store.commit('search/setFilterValue', { name: 'namedEntityPerson', value: ['anne'] })
    core.store.commit('search/toggleFilter', 'namedEntityPerson')
    core.store.commit('search/decontextualizeFilter', 'namedEntityPerson')
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item').at(0).find('.filter__items__item__label').text()).toBe('anne')
    expect(wrapper.findAll('.filter__items__item').at(1).find('.filter__items__item__label').text()).toBe('bruno')
  })

  it('should filter filters items on 2 named entities from different categories', async () => {
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withNer('person_01')
          .withNer('person_02')
          .withNer('organization_01', 1, 'ORGANIZATION')
          .withNer('organization_02', 1, 'ORGANIZATION')
          .withNer('location_01', 1, 'LOCATION')
          .withNer('location_02', 1, 'LOCATION')
      )
      .commit()

    core.store.commit('search/setFilterValue', { name: 'namedEntityPerson', value: ['person_01'] })
    core.store.commit('search/setFilterValue', { name: 'namedEntityOrganization', value: ['organization_01'] })
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
  })

  it('should display the correct number of occurrences if named entity filter is excluded', async () => {
    await letData(es)
      .have(
        new IndexedDocument('document_01', index).withNer('person_01').withNer('organization_01', 1, 'ORGANIZATION')
      )
      .commit()

    await letData(es)
      .have(
        new IndexedDocument('document_02', index).withNer('person_02').withNer('organization_02', 1, 'ORGANIZATION')
      )
      .commit()

    core.store.commit('search/setFilterValue', { name: 'namedEntityOrganization', value: ['organization_01'] })
    core.store.commit('search/toggleFilter', 'namedEntityOrganization')
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
  })

  it('should display an "All" item on top of others items, and this item should be active by default', async () => {
    await letData(es).have(new IndexedDocument(id, index).withContent('person_01').withNer('person_01')).commit()

    await wrapper.vm.root.aggregate({ clearPages: true })
    await core.store.dispatch('search/query', '*')

    expect(wrapper.findAll('.filter__items__all')).toHaveLength(1)
    expect(wrapper.find('.filter__items__all input').element.checked).toBeTruthy()
    expect(wrapper.findAll('.filter__items__all .filter__items__item__label').at(0).text()).toEqual('All')
  })

  it('should load and checked the filter values stored in store', async () => {
    await letData(es).have(new IndexedDocument(id, index).withNer('person_01')).commit()
    core.store.commit('search/setFilterValue', { name: 'namedEntityPerson', value: ['person_01'] })
    await wrapper.vm.$nextTick()
    await wrapper.vm.root.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toEqual('person_01')
    expect(wrapper.findAll('.filter__items__item input').at(0).element.checked).toBeTruthy()
  })

  it('should select the "All" item by default if nothing is selected', async () => {
    await letData(es).have(new IndexedDocument(id, index).withNer('person_01')).commit()
    core.store.commit('search/setFilterValue', { name: 'namedEntityPerson', value: ['person_01'] })
    await wrapper.vm.$nextTick()
    await wrapper.vm.root.aggregate({ clearPages: true })
    await wrapper.findAll('.filter__items__item input').at(0).setChecked(false)
    expect(wrapper.findAll('.filter__items__all input').at(0).element.checked).toBeTruthy()
  })

  describe('Display the list of all available named entities', () => {
    it('should display empty list', async () => {
      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(0)
    })

    it('should display 1 named entity', async () => {
      await letData(es).have(new IndexedDocument(id, index).withNer('person_01')).commit()

      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    })

    it('should display 2 named entities in one document', async () => {
      await letData(es).have(new IndexedDocument(id, index).withNer('person_01').withNer('person_02')).commit()

      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    })

    it('should display 1 named entity in 2 documents', async () => {
      await letData(es)
        .have(new IndexedDocument('document_01', index).withNer('person_01', [2, 25]))
        .commit()
      await letData(es).have(new IndexedDocument('document_02', index).withNer('person_01')).commit()

      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    })

    it('should display 3 named entities in 2 documents in correct order', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withNer('someone_01', 2)).commit()
      await letData(es)
        .have(
          new IndexedDocument('document_02', index)
            .withNer('someone_01', 26)
            .withNer('someone_02', [2, 16, 21])
            .withNer('someone_03', 35)
        )
        .commit()

      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)
      expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toEqual('someone_01')
      expect(wrapper.findAll('.filter__items__item__label').at(2).text()).toEqual('someone_02')
      expect(wrapper.findAll('.filter__items__item__label').at(3).text()).toEqual('someone_03')
    })

    it('should display 3 named entities in 2 documents alphabeticaly', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withNer('paul', 2)).commit()
      await letData(es)
        .have(
          new IndexedDocument('document_02', index)
            .withNer('ines', [2, 16, 21])
            .withNer('paul', 26)
            .withNer('anita', 35)
        )
        .commit()

      core.store.commit('search/sortFilter', { name, sortBy: '_key', sortByOrder: 'asc' })
      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)
      expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toEqual('anita')
      expect(wrapper.findAll('.filter__items__item__label').at(2).text()).toEqual('ines')
      expect(wrapper.findAll('.filter__items__item__label').at(3).text()).toEqual('paul')
    })
  })

  describe('Filtering on named entities', () => {
    it('should filter on named entity filter and return no items', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withNer('person_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withNer('person_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withNer('person_03')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withNer('person_04')).commit()

      wrapper.vm.root.query = 'Windows'
      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(0)
    })

    it('should filter on named entity filter and return all items', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withNer('person_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withNer('person_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withNer('person_03')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withNer('person_04')).commit()

      wrapper.vm.root.query = 'person'
      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(4)
    })

    it('should filter on named entity filter and return only 1 item', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withNer('person_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withNer('person_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withNer('person_03')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withNer('person_04')).commit()

      wrapper.vm.root.query = 'person_01'
      await wrapper.vm.root.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    })
  })
})
