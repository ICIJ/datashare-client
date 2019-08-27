import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/pages/App'
import router from '@/router'
import utils from '@/mixins/utils'
import VueProgressBar from 'vue-progressbar'

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }
})

const localVue = createLocalVue()
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(Murmur)

describe('mixin utils', () => {
  it('should NOT be in SERVER mode', () => {
    const wrapper = shallowMount(App, { localVue, mixins: [utils], router })
    expect(wrapper.vm.isServer).toBeFalsy()
  })

  it('should be in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    const wrapper = shallowMount(App, { localVue, mixins: [utils], router })
    expect(wrapper.vm.isServer).toBeTruthy()
  })
})
