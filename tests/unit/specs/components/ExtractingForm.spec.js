import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import ExtractingForm from '@/components/ExtractingForm'
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

describe('ExtractingForm.vue', () => {
  let wrapper
  esConnectionHelper()

  beforeEach(() => {
    wrapper = shallowMount(ExtractingForm, { localVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk({}))
  })

  afterEach(() => {
    store.commit('indexing/reset')
  })

  it('should call extract action without OCR option, by default', () => {
    datashare.fetch.mockClear()
    wrapper.vm.submitExtract()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: false } }), credentials: 'same-origin' })
  })

  it('should call extract action with OCR option', () => {
    datashare.fetch.mockClear()
    wrapper.vm.ocr = true
    wrapper.vm.submitExtract()

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: true } }), credentials: 'same-origin' })
  })

  it('should reset the modal params on submitting the form', async () => {
    const initialState = cloneDeep(store.state.indexing)
    wrapper.vm.ocr = true
    await wrapper.vm.submitExtract()

    expect(store.state.indexing).toEqual(initialState)
  })

  it('should display a subheader', () => {
    messages.en.indexing.step_02_sub = 'This is a subheader'
    expect(wrapper.findAll('.extracting-form__step__subheader').length).toEqual(1)
    expect(wrapper.findAll('.extracting-form__step__subheader').at(0).text()).toEqual('This is a subheader')
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
