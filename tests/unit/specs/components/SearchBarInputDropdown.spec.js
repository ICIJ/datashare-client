import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'
import { Core } from '@/core'

describe('SearchBarInputDropdown.vue', function () {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()

  it('should display a dropdown with 8 options fields with All fields selected by default', () => {
    const wrapper = shallowMount(SearchBarInputDropdown, { i18n, localVue, router, store })
    expect(wrapper.find('.search-bar-input-fields').element).toBeTruthy()
    expect(wrapper.find('.search-bar-input-fields').element.getAttribute('text')).toBe('All fields')
    expect(wrapper.findAll('b-dropdown-item-stub')).toHaveLength(8)
  })
})
