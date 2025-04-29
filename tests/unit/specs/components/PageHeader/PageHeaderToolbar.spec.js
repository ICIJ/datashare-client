import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import PageHeaderToolbar from '@/components/PageHeader/PageHeaderToolbar'

describe('PageHeaderToolbar.vue', () => {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper = null

  beforeEach(() => {
    wrapper = shallowMount(PageHeaderToolbar, {
      global: {
        plugins,
        renderStubDefaultSlot: true
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
    expect(wrapper.find('row-pagination-stub').exists()).toBeFalsy()
  })

  it('should display a tiny-pagination when `paginable` is true', async () => {
    await wrapper.setProps({ paginable: true })
    expect(wrapper.find('row-pagination-stub').exists()).toBeTruthy()
  })

  it('should NOT display a button-toggle-filters by default', () => {
    expect(wrapper.find('button-toggle-filters-stub').exists()).toBeFalsy()
  })

  it('should display a button-toggle-filters when `paginable` is true', async () => {
    await wrapper.setProps({ filterable: true })
    expect(wrapper.find('button-toggle-filters-stub').exists()).toBeTruthy()
  })
})
