import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ColumnFiltersBadge from '@/components/ColumnFilterBadge'

describe('ColumnFiltersBadge.vue', () => {
  let plugins, wrapper

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('should show icon badge when no counter', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, {
      global: { plugins, renderStubDefaultSlot: true },
      props: { active: true }
    })
    const badgeWrapper = wrapper.find('.column-filter-badge__icon')
    expect(badgeWrapper.exists()).toBeTruthy()
  })

  it('hides icon badge when inactive', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, {
      global: { plugins },
      props: { active: false }
    })
    expect(wrapper.find('.column-filter-badge').exists()).toBeTruthy()
    expect(wrapper.find('.column-filter-badge--inactive').exists()).toBeTruthy()
    await wrapper.setProps({ active: true })
    expect(wrapper.find('.column-filter-badge--inactive').exists()).toBeFalsy()
  })

  it('should show counter badge with number', async () => {
    wrapper = shallowMount(ColumnFiltersBadge, {
      global: { plugins, renderStubDefaultSlot: true },
      props: { counter: 2 }
    })
    const badgeWrapper = wrapper.find('.column-filter-badge__counter')
    expect(badgeWrapper.exists()).toBeTruthy()
    expect(badgeWrapper.text()).toBe('2')
  })
})
