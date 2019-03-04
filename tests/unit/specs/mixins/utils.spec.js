import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/components/App'
import router from '@/router'
import utils from '@/mixins/utils'
import VueProgressBar from 'vue-progressbar'

const localVue = createLocalVue()
localVue.use(VueProgressBar, { color: '#852308' })

describe('utils mixin', () => {
  it('should NOT be in SERVER mode', () => {
    const wrapper = shallowMount(App, { localVue, mixins: [utils], router })
    expect(wrapper.vm.isRemote).toBeFalsy()
  })

  it('should be in SERVER mode', () => {
    localVue.prototype.config = { mode: 'SERVER' }
    const wrapper = shallowMount(App, { localVue, mixins: [utils], router })
    expect(wrapper.vm.isRemote).toBeTruthy()
  })
})
