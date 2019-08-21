import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import DatashareClient from '@/api/DatashareClient'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import { jsonOk } from 'tests/unit/tests_utils'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FindNamedEntitiesForm.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(FindNamedEntitiesForm, { localVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk())
    datashare.fetch.mockClear()
  })

  afterEach(() => {
    store.commit('indexing/reset')
  })

  it('should call findNames action with CoreNLP pipeline, by default', () => {
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: true } }) })
  })

  it('should call findNames action with OpenNLP pipeline', () => {
    wrapper.vm.pipeline = 'opennlp'
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: true } }) })
  })

  it('should call findNames action with no models synchronization', () => {
    wrapper.vm.pipeline = 'corenlp'
    wrapper.vm.offline = true
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: false } }) })
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.pipeline = 'opennlp'
    await wrapper.vm.submitFindNamedEntities()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.pipeline).toEqual('corenlp')
  })

  it('should NOT show offline checkbox in SERVER mode', () => {
    Murmur.config.merge({ mode: 'SERVER' })
    const w = shallowMount(FindNamedEntitiesForm, { localVue, i18n, router, store })

    expect(w.contains('.find-named-entities-form__offline')).toBeFalsy()
  })
})
