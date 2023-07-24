import { createLocalVue, shallowMount } from '@vue/test-utils'

import ColumnFiltersBadge from '@/components/ColumnFilterBadge'
import { Core } from '@/core'

describe('ColumnFiltersBadge.vue', () => {
  const { i18n, localVue } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  it('should show icon badge when no counter', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, { i18n, localVue })
    const badgeWrapper = wrapper.find('.column-filter-badge__icon')
    expect(badgeWrapper.exists()).toBeTruthy()
  })
  it('hides icon badge when inactive', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, { i18n, localVue, propsData: { active: false } })
    expect(wrapper.find('.column-filter-badge').exists()).toBeTruthy()
    expect(wrapper.find('.column-filter-badge--inactive').exists()).toBeTruthy()
    await wrapper.setProps({ active: true })
    expect(wrapper.find('.column-filter-badge--inactive').exists()).toBeFalsy()
  })

  it('should show counter badge with number', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, { i18n, localVue, propsData: { counter: 2 } })
    const badgeWrapper = wrapper.find('.column-filter-badge__counter')
    expect(badgeWrapper.exists()).toBeTruthy()
    expect(badgeWrapper.text()).toBe('2')
  })
})
