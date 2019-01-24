import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FindNamedEntitiesForm from '@/components/FindNamedEntitiesForm'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import cloneDeep from 'lodash/cloneDeep'
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
  })

  afterEach(() => {
    store.commit('indexing/reset')
  })

  it('should call findNames action with CoreNLP pipeline, by default', () => {
    datashare.fetch.mockClear()
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { resume: true } }), credentials: 'same-origin' })
  })

  it('should call findNames action with OpenNLP pipeline', () => {
    datashare.fetch.mockClear()
    wrapper.vm.pipeline = 'opennlp'
    wrapper.vm.submitFindNamedEntities()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      { method: 'POST', body: JSON.stringify({ options: { resume: true } }), credentials: 'same-origin' })
  })

  it('should reset the modal params on submitting the form', async () => {
    const initialState = cloneDeep(store.state.indexing)
    wrapper.vm.pipeline = 'opennlp'
    await wrapper.vm.submitFindNamedEntities()

    expect(store.state.indexing).toEqual(initialState)
  })

  it('should display a subheader', () => {
    messages.en.indexing.find_named_entities_subheader = 'This is a subheader'

    expect(wrapper.findAll('.find-named-entities-form__subheader').length).toEqual(1)
    expect(wrapper.findAll('.find-named-entities-form__subheader').at(0).text()).toEqual('This is a subheader')
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
