import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import { datashare } from '@/store/modules/indexing'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import { jsonOk } from 'tests/unit/tests_utils'

import MountedDataLocation from '@/components/MountedDataLocation'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.use(Vuex)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('MountedDataLocation.vue', () => {
  let wrapper

  beforeEach(async () => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
    Murmur.config.set('mountedDataDir', '/foo/bar')
    wrapper = shallowMount(MountedDataLocation, { localVue, i18n, router, store })
  })

  afterEach(() => {
    datashare.fetch.mockRestore()
  })

  it('should display the delete index button', () => {
    expect(wrapper.find('.mounted-data-location__delete-index').exists()).toBeTruthy()
  })

  it('should display the path to the mounted data directory', () => {
    expect(wrapper.find('.mounted-data-location__value').text()).toBe('/foo/bar')
  })

  it('should emit an index::delete::all event when calling the deleteAll method', async () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('index::delete::all', mockCallback)
    await wrapper.vm.deleteAll()
    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})
