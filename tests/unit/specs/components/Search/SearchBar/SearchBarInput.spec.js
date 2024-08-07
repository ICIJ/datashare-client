import { shallowMount } from '@vue/test-utils'

import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import CoreSetup from '~tests/unit/CoreSetup'

describe('SearchBarInput.vue', function () {
  const { plugins } = CoreSetup.init().useAll()
  let wrapper = null

  const shallowMountFactory = (props = {}) => {
    return shallowMount(SearchBarInput, {
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
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
    expect(wrapper.find('.search-bar-input__tips-addon--active').exists()).toBeFalsy()
    wrapper = shallowMountFactory({ modelValue: 'query' })
    expect(wrapper.find('.search-bar-input__tips-addon--active').exists()).toBeTruthy()
  })
})
