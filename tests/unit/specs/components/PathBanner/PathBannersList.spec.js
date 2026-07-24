import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathBannersList from '@/components/PathBanner/PathBannersList.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'

describe('PathBannersList.vue', () => {
  let global

  const banners = [
    { note: 'Banner one', variant: 'info', path: '/a' },
    { note: 'Banner two', variant: 'warning', path: '/b' }
  ]

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  it('shows the EmptyState component when banners is empty', () => {
    const wrapper = shallowMount(PathBannersList, { global, props: { banners: [] } })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(true)
  })

  it('does not show EmptyState when banners are present', () => {
    const wrapper = shallowMount(PathBannersList, {
      global,
      props: { banners },
      slots: { 'banner-item': '<div />' }
    })
    expect(wrapper.findComponent(EmptyState).exists()).toBe(false)
  })
})
