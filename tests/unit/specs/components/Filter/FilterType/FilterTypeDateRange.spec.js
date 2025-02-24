import find from 'lodash/find'
import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import FilterDateRange from '@/components/Filter/FilterType/FilterTypeDateRange'
import { useSearchStore } from '@/store/modules'

describe('FilterTypeDateRange.vue', () => {
  const { index } = esConnectionHelper.build()
  const name = 'creationDate'

  let wrapper, searchStore

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
    searchStore = useSearchStore()
    searchStore.reset()
    searchStore.decontextualizeFilter(name)
    searchStore.setIndex(index)

    wrapper = mount(FilterDateRange, {
      global: {
        plugins,
        renderStubDefaultSlot: true
      },
      props: {
        filter: searchStore.getFilter({ name })
      }
    })
  })

  it('should add selected value to dedicated filter', async () => {
    const start = new Date('2019-08-19')
    const end = new Date('2019-08-20')

    await wrapper.findAll('input[type=text]').at(0).setValue(start.toDateString())
    await wrapper.findAll('input[type=text]').at(1).setValue(end.toDateString())

    const existingFilter = find(searchStore.instantiatedFilters, { name })
    expect(existingFilter.values).toEqual([`${start.getTime()}:${end.setUTCHours(23, 59, 59, 999)}`])
  })

  it('has two inputs containing the date range', () => {
    const elementStart = wrapper.findAll('input[type=text]').at(0)
    expect(elementStart.exists()).toBeTruthy()
    const startAttr = elementStart.attributes()
    expect(startAttr.placeholder).toBe('MM/DD/YYYY')

    const elementEnd = wrapper.findAll('input[type=text]').at(1)
    expect(elementEnd.exists()).toBeTruthy()
    const endAttr = elementEnd.attributes()
    expect(endAttr.placeholder).toBe('MM/DD/YYYY')
  })
})
