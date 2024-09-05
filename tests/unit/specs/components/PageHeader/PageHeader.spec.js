import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PageHeader from '@/components/PageHeader/PageHeader'

describe('PageHeader.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(PageHeader, {
      global: {
        plugins
      }
    })
  })

  it('should NOT display a form-control-search by default', () => {
    expect(wrapper.find('form-control-search-stub').exists()).toBeFalsy()
  })

  it('should display a form-control-search when `searchable` is true', async () => {
    await wrapper.setProps({ searchable: true })
    expect(wrapper.find('form-control-search-stub').exists()).toBeTruthy()
  })

  it('should NOT display a tiny-pagination by default', () => {
    expect(wrapper.find('tiny-pagination-stub').exists()).toBeFalsy()
  })

  it('should display a tiny-pagination when `paginable` is true', async () => {
    await wrapper.setProps({ paginable: true })
    expect(wrapper.find('tiny-pagination-stub').exists()).toBeTruthy()
  })

  it('should NOT display a button-toggle-filters by default', () => {
    expect(wrapper.find('button-toggle-filters-stub').exists()).toBeFalsy()
  })

  it('should display a button-toggle-filters when `paginable` is true', async () => {
    await wrapper.setProps({ filterable: true })
    expect(wrapper.find('button-toggle-filters-stub').exists()).toBeTruthy()
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
