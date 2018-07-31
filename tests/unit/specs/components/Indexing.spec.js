import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import fetchPonyfill from 'fetch-ponyfill'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Indexing from '@/components/Indexing'
import esConnectionHelper from '..//utils/esConnectionHelper'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import { DatashareClient } from '@/api/DatashareClient'

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
    wrapped = mount(Indexing, {localVue, i18n, router, store})
    sinon.stub(datashare, 'fetch')
  })

  afterEach(() => {
    datashare.fetch.restore()
    wrapped.vm.$store.commit('indexing/reset')
  })

  it('should begin/stop polling when route enter/leave', () => {
    router.push('indexing')
    expect(wrapped.vm.$store.state.indexing.pollHandle).to.not.equal(undefined)

    router.push('/')
    expect(wrapped.vm.$store.state.indexing.pollHandle).to.equal(null)
  })

  it('should update tasks with polling request', async () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateTasks', [{name: 'foo.bar@123', progress: 0.5, state: 'DONE'},
      {name: 'foo.baz@456', progress: 0.2, state: 'RUNNING'}])
    await wrapped.vm.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks')[0].textContent).to.contain('bar(123)')
    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks')[1].textContent).to.contain('baz(456)')
  })

  it('should call index when index action is selected', () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })

    wrapped.vm.$store.dispatch('indexing/query')

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call findNames when selected action is findNames with the correct pipeline', () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.pipeline_corenlp', value: true })

    wrapped.vm.$store.dispatch('indexing/query')

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should call index action with ocr option', async () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', {path: 'form.index', value: true})
    wrapped.vm.$store.commit('indexing/updateField', {path: 'form.ocr', value: true})

    wrapped.vm.$store.dispatch('indexing/query')

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: true}}), credentials: 'same-origin'})
  })

  it('should set first step as default step', () => {
    expect(wrapped.vm.step).to.equal(1)
    expect(wrapped.vm.errors.length).to.equal(0)
  })

  it('should diplay an error message', async () => {
    datashare.fetch.returns(jsonOk({}))
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.errors.length).to.equal(1)
    expect(wrapped.vm.step).to.equal(1)
  })

  it('should diplay the second step of the wizard', async () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.step).to.equal(2)
    expect(wrapped.vm.errors.length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_02').length).to.equal(1)
    expect(wrapped.vm.ocr).to.equal(false)
  })

  it('should display the third step of the wizard', async () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.step).to.equal(3)
    expect(wrapped.vm.errors.length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_03').length).to.equal(1)
  })

  it('should display an error if no NLP pipeline is choosen', async () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    await wrapped.vm.next()
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.step).to.equal(3)
    expect(wrapped.vm.errors.length).to.equal(1)
  })

  it('should display the last and final step', async () => {
    datashare.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.index', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    wrapped.vm.$store.commit('indexing/updateField', { path: 'form.pipeline_opennlp', value: true })
    await wrapped.vm.next()
    await wrapped.vm.next()
    await wrapped.vm.next()
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.step).to.equal(4)
    expect(wrapped.vm.errors.length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_04').length).to.equal(1)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_04 button[type=submit]').length).to.equal(1)
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
