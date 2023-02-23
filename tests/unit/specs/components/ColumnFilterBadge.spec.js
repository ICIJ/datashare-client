import { createLocalVue, shallowMount } from '@vue/test-utils'

import ColumnFiltersBadge from '@/components/ColumnFilterBadge.vue'
import { Core } from '@/core'

describe('ColumnFiltersBadge.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  it('should be visible when active"', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, { i18n, localVue, propsData: { active: false } })
    expect(wrapper.find('.column-filter-badge').exists()).toBeTruthy()
    expect(wrapper.find('.column-filter-badge--inactive').exists()).toBeTruthy()
    await wrapper.setProps({ active: true })
    expect(wrapper.find('.column-filter-badge--inactive').exists()).toBeFalsy()
  })
})
