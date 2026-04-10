import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PathBannersListEntry from '@/components/PathBanner/PathBannersListEntry.vue'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit.vue'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete.vue'
import DisplayStatus from '@/components/Display/DisplayStatus.vue'

describe('PathBannersListEntry.vue', () => {
  let global

  const banner = Object.freeze({
    note: 'Test banner text',
    variant: 'warning',
    path: '/data/docs',
    blurSensitiveMedia: false
  })

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins, renderStubDefaultSlot: true }
  })

  function shallowMountComponent(props = {}) {
    return shallowMount(PathBannersListEntry, {
      global,
      props: { banner, index: 0, ...props }
    })
  }

  it('renders the banner note', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.text()).toContain(banner.note)
  })

  it('renders the banner path', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.find('code').text()).toBe(banner.path)
  })

  describe('blurSensitiveMedia badge', () => {
    it('does not render the sensitive badge when blurSensitiveMedia is false', () => {
      const wrapper = shallowMountComponent()
      const badges = wrapper.findAllComponents(DisplayStatus)
      expect(badges.every(b => b.props('variant') !== 'primary')).toBe(true)
    })

    it('renders the sensitive badge when blurSensitiveMedia is true', () => {
      const wrapper = shallowMountComponent({ banner: { ...banner, blurSensitiveMedia: true } })
      const sensitiveBadge = wrapper.findAllComponents(DisplayStatus).find(b => b.props('variant') === 'primary')
      expect(sensitiveBadge).toBeDefined()
    })
  })

  it('emits banner:edit with the index when edit button is clicked', async () => {
    const wrapper = shallowMountComponent({ index: 3 })
    await wrapper.findComponent(ButtonRowActionEdit).trigger('click')
    expect(wrapper.emitted('banner:edit')).toBeTruthy()
    expect(wrapper.emitted('banner:edit')[0]).toEqual([3])
  })

  it('emits banner:delete with the index when delete button is clicked', async () => {
    const wrapper = shallowMountComponent({ index: 3 })
    await wrapper.findComponent(ButtonRowActionDelete).trigger('click')
    expect(wrapper.emitted('banner:delete')).toBeTruthy()
    expect(wrapper.emitted('banner:delete')[0]).toEqual([3])
  })
})
