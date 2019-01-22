import ResetFiltersButton from '@/components/ResetFiltersButton'
import { shallowMount } from '@vue/test-utils'
import store from '@/store'

describe('ResetFiltersButton.vue', function () {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ResetFiltersButton, { store })
  })

  it('should display a disabled button, by default', () => {
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes().disabled).toEqual('disabled')
  })

  it('should display an active button if a facet is valuated', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })

    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn[disabled]').exists()).toBeFalsy()
  })
})
