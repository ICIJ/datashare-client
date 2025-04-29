import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'

describe('PageHeaderNav.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(PageHeaderNav, {
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  it('should display a navigation-breadcrumb by default', () => {
    expect(wrapper.find('navigation-breadcrumb-stub').exists()).toBeTruthy()
  })

  it('should NOT  display a navigation-breadcrumb when `noBreadcrumb` is true', async () => {
    await wrapper.setProps({ noBreadcrumb: true })
    expect(wrapper.find('navigation-breadcrumb-stub').exists()).toBeFalsy()
  })

  it('should display a button-toggle-settings by default', () => {
    expect(wrapper.find('button-toggle-settings-stub').exists()).toBeTruthy()
  })

  it('should NOT display a button-toggle-settings when `noBreadcrumb` is true', async () => {
    await wrapper.setProps({ noToggleSettings: true })
    expect(wrapper.find('button-toggle-settings-stub').exists()).toBeFalsy()
  })
})
