import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/pages/App'
import router from '@/router'
import store from '@/store'
import utils from '@/mixins/utils'
import VueProgressBar from 'vue-progressbar'

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

  it('should refresh the route', () => {
    const wrapper = shallowMount(App, { localVue, mixins: [utils], router, store })
    jest.spyOn(router, 'push')

    wrapper.vm.refreshRoute()

    expect(router.push).toHaveBeenCalled()
  })
})
