import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ColumnFilter from '@/components/ColumnFilter'

describe('ColumnFilter.vue', () => {
  let plugins

  function createContainer() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    return div
  }

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('display the name of the filter with a button and a badge', async () => {
    const props = { id: 'filter_id', name: 'filter_name', active: false }
    const attachTo = createContainer()

    const wrapper = shallowMount(ColumnFilter, {
      attachTo,
      global: { plugins, renderStubDefaultSlot: true },
      props
    })

    expect(wrapper.find('.column-filter').exists()).toBeTruthy()
    const toggleSelector = '#column-filter__toggle--filter_id-id.column-filter__toggle--filter_id'
    expect(wrapper.find(toggleSelector).exists()).toBeTruthy()
    expect(wrapper.find('column-filter-badge-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-popover-stub').exists()).toBeTruthy()
  })

  it('sets badge to active when filter is active', async () => {
    const props = { id: 'filter_id', name: 'filter_name', active: false }
    const wrapper = shallowMount(ColumnFilter, {
      global: { plugins, renderStubDefaultSlot: true },
      props
    })

    expect(wrapper.findComponent({ name: 'column-filter-badge' }).props('active')).toBe(false)
    await wrapper.setProps({ active: true })
    expect(wrapper.findComponent({ name: 'column-filter-badge' }).props('active')).toBe(true)
  })
})
