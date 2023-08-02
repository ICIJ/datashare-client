import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import { Core } from '@/core'

describe('SearchBarInputDropdown.vue', function () {
  const { i18n, localVue, store, config } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()

  beforeAll(() => {
    config.set('projects', [{ name: 'local-datashare', label: 'default' }])
  })

  it('should display a dropdown with 8 options fields', () => {
    const wrapper = shallowMount(SearchBarInputDropdown, { i18n, localVue, router, store })
    expect(wrapper.findAll('b-dropdown-item-stub')).toHaveLength(8)
  })

  it('should display a dropdown with "All fields" selected by default', () => {
    const wrapper = shallowMount(SearchBarInputDropdown, { i18n, localVue, router, store })
    expect(wrapper.find('b-dropdown-item-stub[active=true]').text().trim()).toBe('All fields')
  })
})
