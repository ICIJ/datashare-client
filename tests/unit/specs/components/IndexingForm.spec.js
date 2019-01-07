import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount } from '@vue/test-utils'
import fetchPonyfill from 'fetch-ponyfill'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import IndexingForm from '@/components/IndexingForm'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import cloneDeep from 'lodash/cloneDeep'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import DatashareClient from '@/api/DatashareClient'

const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})

describe('Indexing.vue', () => {
  var wrapped = null
  esConnectionHelper()

  beforeEach(() => {
    wrapped = mount(IndexingForm, {localVue, i18n, router, store})
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk({}))
  })

  afterEach(() => {
    wrapped.vm.$store.commit('indexing/reset')
  })

  it('should call index when index action is selected', () => {
    datashare.fetch.mockClear()
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapped.vm.$store.dispatch('indexing/query')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call findNames when selected action is findNames with the correct pipeline', () => {
    datashare.fetch.mockClear()
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.pipeline', value: 'opennlp' })
    wrapped.vm.$store.dispatch('indexing/query')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should call index action with ocr option', async () => {
    datashare.fetch.mockClear()
    wrapped.vm.$store.commit('indexing/updateField', {path: 'form.index', value: true})
    wrapped.vm.$store.commit('indexing/updateField', {path: 'form.ocr', value: true})
    wrapped.vm.$store.dispatch('indexing/query')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toBeCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: true}}), credentials: 'same-origin'})
  })

  it('should set first step as default step', () => {
    expect(wrapped.vm.step).toEqual(1)
    expect(wrapped.vm.errors.length).toEqual(0)
  })

  it('should diplay an error message', async () => {
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.errors.length).toEqual(1)
    expect(wrapped.vm.step).toEqual(1)
  })

  it('should diplay the second step of the wizard', async () => {
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.step).toEqual(2)
    expect(wrapped.vm.errors.length).toEqual(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing-form__step--02').length).toEqual(1)
    expect(wrapped.vm.ocr).toEqual(false)
  })

  it('should display the third step of the wizard', async () => {
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.step).toEqual(3)
    expect(wrapped.vm.errors.length).toEqual(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing-form__step--03').length).toEqual(1)
  })

  it('should set Core NLP as default pipeline', async () => {
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.step).toEqual(3)
    expect(wrapped.vm.pipeline).toEqual('corenlp')
  })

  it('should display the last and final step', async () => {
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapped.vm.next()
    await wrapped.vm.next()
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.step).toEqual(4)
    expect(wrapped.vm.errors.length).toEqual(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing-form__step--04').length).toEqual(1)
    expect(wrapped.vm.$el.querySelectorAll('.indexing-form__step--04 button[type=submit]').length).toEqual(1)
  })

  it('should reset the modal params on submitting the form', async () => {
    let initialState = cloneDeep(store.state.indexing)
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.ocr', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.pipeline', value: 'opennlp' })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.step', value: 3 })
    await wrapped.vm.submit()

    expect(store.state.indexing).toEqual(initialState)
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
