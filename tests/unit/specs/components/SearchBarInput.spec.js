import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import SearchBarInput from '@/components/SearchBarInput'
import { Core } from '@/core'

describe('SearchBarInput.vue', function () {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter()

  let wrapper = null
  const shallowMountFactory = (propsData = {}) => {
    return shallowMount(SearchBarInput, { i18n, localVue, router, store, propsData })
  }

  it('should display search bar input', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar-input__input').element).toBeTruthy()
  })

  it('should disable submit button when disableSubmit is true', async () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar-input__submit').element.disabled).toBe(false)
    await wrapper.setProps({ disableSubmit: true })
    expect(wrapper.find('.search-bar-input__submit').element.disabled).toBe(true)
  })

  it('should show tips when there is a query', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.find('.search-bar-input__tips-addon--active').element).toBeFalsy()
    wrapper = shallowMountFactory({ query: 'query' })
    expect(wrapper.find('.search-bar-input__tips-addon--active').element).toBeTruthy()
  })
})
