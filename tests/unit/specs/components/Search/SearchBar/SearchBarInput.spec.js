import { mount } from '@vue/test-utils'

import SearchBarInput from '@/components/Search/SearchBar/SearchBarInput'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import CoreSetup from '~tests/unit/CoreSetup'

describe('SearchBarInput.vue', function () {
  let wrapper = null

  const shallowMountFactory = (props = { showSubmit: true }) => {
    const { plugins } = CoreSetup.init().useAll()

    return mount(SearchBarInput, {
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  }

  it('should display search bar input', () => {
    wrapper = shallowMountFactory()
    expect(wrapper.findComponent(FormControlSearch).exists()).toBeTruthy()
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
