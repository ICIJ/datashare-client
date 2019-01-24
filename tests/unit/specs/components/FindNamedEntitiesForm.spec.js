import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import DatashareClient from '@/api/DatashareClient'
import fetchPonyfill from 'fetch-ponyfill'
const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages })

describe('FindNamedEntitiesForm.vue', () => {
  let wrapper
  esConnectionHelper()

  beforeEach(() => {
    wrapper = shallowMount(FindNamedEntitiesForm, { localVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk({}))
    datashare.fetch.mockClear()
  })

  afterEach(() => {
    store.commit('indexing/reset')
  })

  it('should call findNames action with CoreNLP pipeline, by default', () => {
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: true } }), credentials: 'same-origin' })
  })

  it('should call findNames action with OpenNLP pipeline', () => {
    wrapper.vm.pipeline = 'opennlp'
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      { method: 'POST', body: JSON.stringify({ options: {syncModels: true} }), credentials: 'same-origin' })
  })

  it('should call findNames action with no models synchronization', () => {
    wrapper.vm.pipeline = 'corenlp'
    wrapper.vm.offline = true
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: false } }), credentials: 'same-origin' })
  })

  it('should reset the modal params on submitting the form', async () => {
    wrapper.vm.pipeline = 'opennlp'
    await wrapper.vm.submitFindNamedEntities()

    expect(wrapper.vm.pipeline).toEqual('corenlp')
  })

  it('should not render a subheader if empty', () => {
    messages.en.indexing.find_named_entities_subheader = ''

    expect(wrapper.vm.shouldRender('indexing.find_named_entities_subheader')).toBeFalsy()
  })

  it('should render a subheader and display it', () => {
    messages.en.indexing.find_named_entities_subheader = 'This is a subheader'

    expect(wrapper.vm.shouldRender('indexing.find_named_entities_subheader')).toBeTruthy()
    expect(wrapper.findAll('.find-named-entities-form__subheader').length).toEqual(1)
    expect(wrapper.find('.find-named-entities-form__subheader').text()).toEqual('This is a subheader')
  })
})

function jsonOk (body) {
  const mockResponse = new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}
