import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import BatchSearchFilterDropdown from '@/components/BatchSearchFilterDropdown'

describe('BatchSearchFilterDropdown.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()

  let wrapper = null
  it('displays a batch search filter with a dropdown', () => {
    const propsData = { id: 'filter_id', name: 'filter_name', values: null, items: ['projectA', 'projectB'] }
    wrapper = shallowMount(BatchSearchFilterDropdown, { i18n, localVue, propsData })
    expect(wrapper.find('.batch-search-filter-dropdown').exists()).toBe(true)
    expect(wrapper.find('selectable-dropdown-stub').exists()).toBe(true)
  })

  it('actives filters on single value', async () => {
    const propsData = { id: 'filter_id', name: 'filter_name', values: null, items: ['projectA', 'projectB'] }
    wrapper = shallowMount(BatchSearchFilterDropdown, { i18n, localVue, propsData })
    expect(wrapper.vm.isActive).toBe(false)
    await wrapper.setProps({ values: { value: 'projectA' } })
    expect(wrapper.vm.isActive).toBe(true)
  })

  it('actives filters on multiple values', async () => {
    const propsData = { id: 'filter_id', name: 'filter_name', values: null, items: ['projectA', 'projectB'] }
    wrapper = shallowMount(BatchSearchFilterDropdown, { i18n, localVue, propsData })
    expect(wrapper.vm.isActive).toBe(false)
    await wrapper.setProps({ values: ['projectA', 'projectB'] })
    expect(wrapper.vm.isActive).toBe(true)
  })
})
