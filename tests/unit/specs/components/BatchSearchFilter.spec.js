import { createLocalVue, shallowMount } from '@vue/test-utils'

import BatchSearchFilter from '@/components/BatchSearchFilter'
import { Core } from '@/core'

describe('BatchSearchFilter.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()

  function createContainer() {
    const div = document.createElement('div')
    document.body.appendChild(div)
    return div
  }
  let wrapper = null
  it('display the name of the filter with a button and a badge', async () => {
    const propsData = { id: 'filter_id', name: 'filter_name', active: false }
    const attachTo = createContainer()

    wrapper = shallowMount(BatchSearchFilter, { attachTo, i18n, localVue, propsData })
    expect(wrapper.find('.batch-search-filter').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-filter__label').text()).toBe('filter_name')
    const toggleSelector = '#batch-search-filter__toggle--filter_id-id.batch-search-filter__toggle--filter_id'
    expect(wrapper.find(toggleSelector).exists()).toBeTruthy()
    expect(wrapper.find('batch-search-filter-badge-stub').exists()).toBeTruthy()
    expect(wrapper.find('b-popover-stub').exists()).toBeTruthy()
  })

  it('shows set badge to active when filter is active', async () => {
    const propsData = { id: 'filter_id', name: 'filter_name', active: false }
    wrapper = shallowMount(BatchSearchFilter, { i18n, localVue, propsData })
    expect(wrapper.find('batch-search-filter-badge-stub').vm?.active).toBe(false)
    await wrapper.setProps({ active: true })
    expect(wrapper.find('batch-search-filter-badge-stub').vm?.active).toBe(true)
  })

  // TODO CD: test popover with slot?
})
