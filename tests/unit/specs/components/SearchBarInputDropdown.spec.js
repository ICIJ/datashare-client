import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import { Core } from '@/core'

describe('SearchBarInputDropdown.vue', function () {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()

  let wrapper = null
  const shallowMountFactory = (propsData = {}) => {
    return shallowMount(SearchBarInputDropdown, { i18n, localVue, router, store, propsData })
  }

  it('should display a dropdown with 8 options fields with All fields selected by default', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar-input-dropdown').element).toBeTruthy()
    expect(wrapper.find('.search-bar-input-dropdown').element.getAttribute('text')).toBe('All fields')
    expect(wrapper.findAll('b-dropdown-item-stub')).toHaveLength(8)
  })

  it('should show tips when there is a query', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar-input__tips-addon--active').element).toBeFalsy()
    wrapper = shallowMountFactory({ query: 'query' })
    expect(wrapper.find('.search-bar-input__tips-addon--active').element).toBeTruthy()
  })
})
