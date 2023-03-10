import find from 'lodash/find'
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

import { Core } from '@/core'
import FilterDateRange from '@/components/filter/types/FilterDateRange'

const { localVue, i18n, store, wait } = Core.init(createLocalVue()).useAll()
const router = new VueRouter()

describe('FilterDateRange.vue', () => {
  const { index } = esConnectionHelper.build()
  const name = 'creationDate'
  const filter = store.getters['search/getFilter']({ name })
  let wrapper = null

  beforeEach(() => {
    store.commit('search/decontextualizeFilter', name)
    store.commit('search/index', index)
    wrapper = mount(FilterDateRange, {
      localVue,
      i18n,
      store,
      router,
      wait,
      propsData: {
        filter
      }
    })
  })

  afterEach(() => store.commit('search/reset'))

  it('should add selected value to dedicated filter', () => {
    const start = new Date('2019-08-19')
    const end = new Date('2019-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })

    const expectedStart = Date.parse(start) - start.getTimezoneOffset() * 60 * 1000
    const expectedEnd = Date.parse(end) - end.getTimezoneOffset() * 60 * 1000 + 24 * 60

    const existingFilter = find(store.getters['search/instantiatedFilters'], { name })
    expect(existingFilter.values).toEqual([expectedStart, expectedEnd])
  })

  it('should set selected value to dedicated filter, as the only one value', () => {
    const start = new Date('2018-08-19')
    const end = new Date('2018-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start, end })

    const start2 = new Date('2019-08-19')
    const end2 = new Date('2019-08-20')
    wrapper.vm.$set(wrapper.vm, 'selectedDate', { start: start2, end: end2 })

    const expectedStart = Date.parse(start2) - start2.getTimezoneOffset() * 60 * 1000
    const expectedEnd = Date.parse(end2) - end2.getTimezoneOffset() * 60 * 1000 + 24 * 60

    const existingFilter = find(store.getters['search/instantiatedFilters'], { name })
    expect(existingFilter.values).toEqual([expectedStart, expectedEnd])
  })
  it('has two inputs containing the date range', () => {
    const elementStart = wrapper.find('.filter--date-range__inputs__start')
    expect(elementStart.exists()).toBeTruthy()
    const startAttr = elementStart.attributes()
    expect(startAttr.title).toBe('From MM/DD/YYYY')
    expect(startAttr.alt).toBe('Starting date')
    expect(startAttr.placeholder).toBe('MM/DD/YYYY')

    const elementEnd = wrapper.find('.filter--date-range__inputs__end')
    expect(elementEnd.exists()).toBeTruthy()
    const endAttr = elementEnd.attributes()
    expect(endAttr.title).toBe('To MM/DD/YYYY')
    expect(endAttr.alt).toBe('Ending date')
    expect(endAttr.placeholder).toBe('MM/DD/YYYY')
  })
  it('changes date format to DD/MM/YYYY according to FR locale', async () => {
    expect(i18n.locale).toBe('en')
    const startAttr = wrapper.find('.filter--date-range__inputs__start').attributes()
    expect(startAttr.placeholder).toBe('MM/DD/YYYY')
    i18n.locale = 'fr'
    const wrapper2 = mount(FilterDateRange, {
      localVue,
      i18n,
      store,
      router,
      wait,
      propsData: {
        filter
      }
    })
    await wrapper2.vm.$nextTick()
    const startAttrFr = wrapper2.find('.filter--date-range__inputs__start').attributes()
    expect(startAttrFr.placeholder).toBe('DD/MM/YYYY')
  })
})
