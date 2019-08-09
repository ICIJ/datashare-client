import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'

import VersionNumber from '@/components/VersionNumber'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.use(Vuex)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('VersionNumber.vue', () => {
  let wrapper

  beforeEach(async () => {
    const methods = {
      fetchVersion: () => ({
        'git.build.version': 'X.Y.Z',
        'git.commit.id.abbrev': 'sha1_abbrev'
      })
    }
    wrapper = shallowMount(VersionNumber, { localVue, i18n, router, store, methods })
  })

  it('should display client git sha1', () => {
    const sha1 = wrapper.vm.clientHash
    expect(sha1.match(/[a-z0-9]*/)[0]).toEqual(sha1)
    expect(sha1.length).toEqual(7)
  })

  it('should display server git sha1 and version', async () => {
    await wrapper.vm.setVersion()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.version-number').text()).toEqual('Version X.Y.Z')
    expect(wrapper.find('.version-number__tooltip__server__value').text()).toEqual('sha1_abbrev')
  })
})
