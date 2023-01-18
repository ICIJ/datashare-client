import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import FilterSortByDropdown from '@/components/filter/FilterSortByDropdown'

const { localVue, i18n } = Core.init(createLocalVue()).useAll()

describe('FilterSortByDropdown', () => {
  const propsData = {
    sort: { sortBy: '_count', sortByOrder: 'desc' },
    sortByOptions: [
      { sortBy: '_count', sortByOrder: 'asc' },
      { sortBy: '_count', sortByOrder: 'desc' },
      { sortBy: '_key', sortByOrder: 'asc' },
      { sortBy: '_key', sortByOrder: 'desc' }
    ]
  }

  it('should display a list of 4 options', () => {
    const wrapper = mount(FilterSortByDropdown, { localVue, i18n, propsData })
    expect(wrapper.findAll('.dropdown-item')).toHaveLength(4)
  })

  it('should use "_count" and "desc" order', () => {
    const wrapper = mount(FilterSortByDropdown, { localVue, i18n, propsData })
    expect(wrapper.vm.sortBy).toBe('_count')
    expect(wrapper.vm.sortByOrder).toBe('desc')
    expect(wrapper.find('.dropdown-item.active').text()).toBe('Occurrences (decreasing)')
  })

  it('should switch "_count" and "asc" order', async () => {
    const wrapper = mount(FilterSortByDropdown, { localVue, i18n, propsData })
    const sort = { sortBy: '_count', sortByOrder: 'asc' }
    wrapper.setProps({ sort })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.dropdown-item.active').text()).toBe('Occurrences (increasing)')
  })

  it('should emit update:sort when clicking on a new option', async () => {
    const wrapper = mount(FilterSortByDropdown, { localVue, i18n, propsData })
    // Item 2 has a different sortBy and and different sortByOrder
    wrapper.findAll('.dropdown-item').at(2).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:sort')).toHaveLength(1)
  })
})
