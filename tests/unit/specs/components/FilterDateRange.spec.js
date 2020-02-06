import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FilterDateRange from '@/components/FilterDateRange'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

const { localVue, i18n, store } = App.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('FilterDateRange.vue', () => {
  const index = toLower('FilterDateRange')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper
  const name = 'creationDate'

  beforeEach(() => {
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', index)
    wrapper = mount(FilterDateRange, { localVue, i18n, store, router, propsData: { filter: find(store.getters['search/instantiatedFilters'], { name }) } })
  })

  afterEach(() => store.commit('search/reset'))

  it('should display a date picker', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index)
      .withCreationDate('2018-04-01T00:00:00.000Z')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.find('.filter__items .date-picker input').exists()).toBeTruthy()
    expect(wrapper.find('.filter__items .date-picker input').attributes('placeholder')).toBe('Select a date range')
  })

  it('should add selected value to dedicated filter', () => {
    const start = new Date('2019-08-19')
    const end = new Date('2019-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })

    wrapper.vm.onInput()

    const existingFilter = find(store.getters['search/instantiatedFilters'], { name })
    expect(existingFilter.values).toEqual([start.getTime(), end.getTime()])
  })

  it('should set selected value to dedicated filter, as the only one value', () => {
    const start = new Date('2018-08-19')
    const end = new Date('2018-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })
    wrapper.vm.onInput()

    const start2 = new Date('2019-08-19')
    const end2 = new Date('2019-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start: start2, end: end2 })
    wrapper.vm.onInput()

    const existingFilter = find(store.getters['search/instantiatedFilters'], { name })
    expect(existingFilter.values).toEqual([start2.getTime(), end2.getTime()])
  })

  it('should reset selectedDate on event "reset-filter-values"', () => {
    const start = new Date('2018-08-19')
    const end = new Date('2018-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })

    wrapper.vm.root.$emit('reset-filter-values')

    expect(wrapper.vm.selectedDate).toBeNull()
  })

  it('should update selectedDate from the store value', () => {
    store.commit('search/setFilterValue', { name, value: [new Date('2018-01-01').getTime(), new Date('2018-12-31').getTime()] })
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start: new Date('2019-08-19'), end: new Date('2019-08-22') })

    wrapper.vm.selectedValuesFromStore()
    wrapper.vm.$emit('selected-values-from-store')

    expect(wrapper.vm.selectedDate).toEqual({ start: new Date('2018-01-01'), end: new Date('2018-12-31') })
  })
})
