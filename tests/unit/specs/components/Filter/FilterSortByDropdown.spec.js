import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FilterSortByDropdown from '@/components/Filter/FilterSortByDropdown'

describe('FilterSortByDropdown', () => {
  const props = {
    sort: { sortBy: '_count', sortByOrder: 'desc' },
    sortByOptions: [
      { sortBy: '_count', sortByOrder: 'asc' },
      { sortBy: '_count', sortByOrder: 'desc' },
      { sortBy: '_key', sortByOrder: 'asc' },
      { sortBy: '_key', sortByOrder: 'desc' }
    ]
  }

  let wrapper

  beforeEach(() => {
    const { plugins } = CoreSetup.init().useAll()
    wrapper = mount(FilterSortByDropdown, { global: { plugins }, props })
  })

  it('should display a list of 4 options', () => {
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(4)
  })

  it('should use "_count" and "desc" order', () => {
    expect(wrapper.vm.sortBy).toBe('_count')
    expect(wrapper.vm.sortByOrder).toBe('desc')
    expect(wrapper.find('.dropdown-item.active').text()).toBe('Occurrences (decreasing)')
  })

  it('should switch "_count" and "asc" order', async () => {
    const sort = { sortBy: '_count', sortByOrder: 'asc' }
    wrapper.setProps({ sort })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown-item.active').text()).toBe('Occurrences (increasing)')
  })

  it('should emit update:sort when clicking on a new option', async () => {
    // Item 2 has a different sortBy and and different sortByOrder
    wrapper.findAll('.dropdown-item').at(2).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:sort')).toHaveLength(1)
  })
})
