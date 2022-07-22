import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import AppliedSearchFilters from '@/components/AppliedSearchFilters'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('AppliedSearchFilters.vue', () => {
  jest.setTimeout(1e4)
  const { index } = esConnectionHelper.build()
  let wrapper

  beforeAll(() => store.commit('search/index', index))

  beforeEach(() => {
    wrapper = shallowMount(AppliedSearchFilters, { i18n, localVue, store })
  })

  afterEach(() => store.commit('search/reset'))

  describe('displays applied filters', () => {
    it('should display 2 applied filters', async () => {
      await store.dispatch('search/query', { query: 'document test', from: 0, size: 3 })

      expect(wrapper.findAll('.applied-search-filters applied-search-filters-item-stub')).toHaveLength(2)
    })

    it('should display 1 applied filter', async () => {
      await store.commit('search/setFilterValue', { name: 'contentType', value: 'term_01' })

      expect(wrapper.findAll('.applied-search-filters applied-search-filters-item-stub')).toHaveLength(1)
    })

    it('should translate the label of a filter', () => {
      store.commit('search/setFilterValue', { name: 'contentType', value: 'text/plain' })

      expect(wrapper.vm.filters[0].label).toBe('Plain text document')
    })

    it('should translate the label of a filter date', () => {
      store.commit('search/setFilterValue', { name: 'indexingDate', value: 1556668800000 })

      expect(wrapper.vm.filters[0].label).toBe('2019-05')
    })

    it('should translate the label of a filter date, even if it is a string ie. coming from the url query', () => {
      store.commit('search/setFilterValue', { name: 'indexingDate', value: '1556668800000' })

      expect(wrapper.vm.filters[0].label).toBe('2019-05')
    })

    it('should translate the label of a filter date range', () => {
      store.commit('search/setFilterValue', { name: 'creationDate', value: [1556668800000, 1566908357980] })

      expect(wrapper.vm.filters[0].label).toBe('05/01/2019')
      expect(wrapper.vm.filters[1].label).toBe('08/27/2019')
    })

    it('should translate in French the label of a filter date range', () => {
      localStorage.setItem('locale', 'fr')
      store.commit('search/setFilterValue', { name: 'creationDate', value: [1556668800000, 1566908357980] })

      expect(wrapper.vm.filters[0].label).toBe('01/05/2019')
      expect(wrapper.vm.filters[1].label).toBe('27/08/2019')
    })

    it('should translate the label of a filter yes no', () => {
      store.commit('search/setFilterValue', { name: 'starred', value: true })

      expect(wrapper.vm.filters[0].label).toBe('Starred')
    })

    it('should set filter as positive applied filter', () => {
      store.commit('search/setFilterValue', { name: 'contentType', value: 'term_01' })

      expect(wrapper.vm.filters[0].negation).toBeFalsy()
    })

    it('should set excluded filter as negative applied filter', () => {
      store.commit('search/setFilterValue', { name: 'contentType', value: 'term_01' })
      store.commit('search/toggleFilter', 'contentType')

      expect(wrapper.vm.filters[0].negation).toBeTruthy()
    })

    it('should display regex as applied filter', async () => {
      await store.dispatch('search/query', { query: '/.*test.*/', from: 0, size: 3 })

      expect(wrapper.findAll('.applied-search-filters applied-search-filters-item-stub')).toHaveLength(1)
    })
  })

  describe('deletes applied filters', () => {
    beforeEach(() => {
      wrapper = mount(AppliedSearchFilters, { localVue, router, store, mocks: { $t: msg => msg } })
    })

    it('should remove the "AND" on last applied filter deletion', async () => {
      await store.dispatch('search/query', { query: 'term_01 AND term_02', from: 0, size: 3 })
      wrapper.findAll('.applied-search-filters .applied-search-filters-item').at(1).trigger('click')

      expect(store.state.search.query).toBe('term_01')
    })

    it('should remove the "OR" on last applied filter deletion', async () => {
      await store.dispatch('search/query', { query: 'term_01 OR term_02', from: 0, size: 3 })
      wrapper.findAll('.applied-search-filters .applied-search-filters-item').at(1).trigger('click')

      expect(store.state.search.query).toBe('term_01')
    })
  })
})
