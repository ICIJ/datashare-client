import find from 'lodash/find'
import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import FilterDateRange from '@/components/filter/types/FilterDateRange'

describe('FilterDateRange.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const name = 'creationDate'

  let wrapper

  beforeEach(() => {
    const { store, plugins } = CoreSetup.init(api).useAll().useRouter()
    const filter = store.getters['search/getFilter']({ name })

    store.commit('search/decontextualizeFilter', name)
    store.commit('search/index', index)

    wrapper = mount(FilterDateRange, {
      global: {
        plugins,
        renderStubDefaultSlot: true
      },
      props: {
        filter
      }
    })
  })

  afterEach(() => wrapper.vm.$store.commit('search/reset'))

  it('should add selected value to dedicated filter', async () => {
    const start = new Date('2019-08-19')
    const end = new Date('2019-08-20')

    await wrapper.find('.filter--date-range__inputs__start').setValue(start.toDateString())
    await wrapper.find('.filter--date-range__inputs__end').setValue(end.toDateString())

    const expectedStart = Date.parse(start) - start.getTimezoneOffset() * 60 * 1000
    const expectedEnd = Date.parse(end) - end.getTimezoneOffset() * 60 * 1000 + 24 * 60

    const existingFilter = find(wrapper.vm.$store.getters['search/instantiatedFilters'], { name })
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
})
