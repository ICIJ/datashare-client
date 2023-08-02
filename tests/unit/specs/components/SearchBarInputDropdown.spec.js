import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import { Core } from '@/core'

describe('SearchBarInputDropdown.vue', function () {
  const { i18n, localVue, store, config } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()
  let wrapper

  beforeAll(() => {
    config.set('projects', [{ name: 'local-datashare', label: 'default' }])
    const options = ['all', 'relevance', 'creationDateNewest']
    const optionsPath = ['search', 'field']
    const propsData = { options, optionsPath, value: 'all' }
    wrapper = shallowMount(SearchBarInputDropdown, { propsData, i18n, localVue, router, store })
  })

  it('should display a dropdown with 2 options fields', () => {
    expect(wrapper.findAll('b-dropdown-item-stub')).toHaveLength(3)
  })

  it('should display a dropdown with "All fields" selected by default', () => {
    expect(wrapper.find('b-dropdown-item-stub[active=true]').text().trim()).toBe('All fields')
  })
})
