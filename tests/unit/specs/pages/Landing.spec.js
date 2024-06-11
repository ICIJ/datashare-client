import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Landing from '@/pages/Landing'

describe('Landing.vue', () => {
  const { config, plugins } = CoreSetup.init().useAll()
  let wrapper

  beforeEach(() => {
    config.merge({ projects: [{ name: 'project' }] })
    wrapper = shallowMount(Landing, { global: { plugins } })
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.landing__form__search-bar').exists()).toBeTruthy()
  })

  it('should display project cards', () => {
    expect(wrapper.find('.landing__projects').exists()).toBeTruthy()
  })
})
