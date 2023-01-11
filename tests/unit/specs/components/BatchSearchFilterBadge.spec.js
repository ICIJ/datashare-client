import { createLocalVue, shallowMount } from '@vue/test-utils'

import BatchSearchFilterBadge from '@/components/BatchSearchFilterBadge'
import { Core } from '@/core'

describe('BatchSearchFiltersBadge.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  it('should be visible when active"', async () => {
    wrapper = shallowMount(BatchSearchFilterBadge, { i18n, localVue, propsData: { active: false } })
    expect(wrapper.find('.batch-search-filter-badge').exists()).toBeTruthy()
    expect(wrapper.find('.batch-search-filter-badge--inactive').exists()).toBeTruthy()
    await wrapper.setProps({ active: true })
    expect(wrapper.find('.batch-search-filter-badge--inactive').exists()).toBeFalsy()
  })
})
