import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import IndexingForm from '@/components/IndexingForm'
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

describe('Indexing.vue', () => {
  let wrapper
  esConnectionHelper()

  beforeEach(() => {
    wrapper = shallowMount(IndexingForm, { localVue, i18n, router, store })
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk({}))
  })

  afterEach(() => {
    wrapper.vm.$store.commit('indexing/reset')
  })

  it('should call index when index action is selected', () => {
    datashare.fetch.mockClear()
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapper.vm.$store.dispatch('indexing/query')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call findNames when selected action is findNames with the correct pipeline', () => {
    datashare.fetch.mockClear()
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.pipeline', value: 'opennlp' })
    wrapper.vm.$store.dispatch('indexing/query')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      { method: 'POST', body: JSON.stringify({ options: { resume: true } }), credentials: 'same-origin' })
  })

  it('should call index action with ocr option', async () => {
    datashare.fetch.mockClear()
    wrapper.vm.$store.commit('indexing/updateField', {path: 'form.index', value: true})
    wrapper.vm.$store.commit('indexing/updateField', {path: 'form.ocr', value: true})
    wrapper.vm.$store.dispatch('indexing/query')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: true } }), credentials: 'same-origin' })
  })

  it('should set first step as default step', () => {
    expect(wrapper.vm.step).toEqual(1)
    expect(wrapper.vm.errors.length).toEqual(0)
  })

  it('should display an error message', async () => {
    await wrapper.vm.next()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.errors.length).toEqual(1)
    expect(wrapper.vm.step).toEqual(1)
  })

  it('should diplay the second step of the wizard', async () => {
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    await wrapper.vm.next()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.step).toEqual(2)
    expect(wrapper.vm.errors.length).toEqual(0)
    expect(wrapper.findAll('.indexing-form__step--02').length).toEqual(1)
    expect(wrapper.vm.ocr).toEqual(false)
  })

  it('should display the third step of the wizard', async () => {
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapper.vm.next()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.step).toEqual(3)
    expect(wrapper.vm.errors.length).toEqual(0)
    expect(wrapper.findAll('.indexing-form__step--03').length).toEqual(1)
  })

  it('should set Core NLP as default pipeline', async () => {
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapper.vm.next()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.step).toEqual(3)
    expect(wrapper.vm.pipeline).toEqual('corenlp')
  })

  it('should display the last and final step', async () => {
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapper.vm.next()
    await wrapper.vm.next()
    await wrapper.vm.next()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.step).toEqual(4)
    expect(wrapper.vm.errors.length).toEqual(0)
    expect(wrapper.findAll('.indexing-form__step--04').length).toEqual(1)
    expect(wrapper.findAll('.indexing-form__step--04 button[type=submit]').length).toEqual(1)
  })

  it('should reset the modal params on submitting the form', async () => {
    let initialState = cloneDeep(store.state.indexing)
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.ocr', value: true })
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.pipeline', value: 'opennlp' })
    wrapper.vm.$store.commit('indexing/updateField', { path: 'form.step', value: 3 })
    await wrapper.vm.submit()

    expect(store.state.indexing).toEqual(initialState)
  })

  it('should display a subheader', async () => {
    messages.en.indexing.step_01_sub = 'This is a subheader'
    expect(wrapper.findAll('.indexing-form__step__subheader').length).toEqual(1)
    expect(wrapper.findAll('.indexing-form__step__subheader').at(0).text()).toEqual('This is a subheader')
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
