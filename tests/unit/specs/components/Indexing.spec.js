import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount } from '@vue/test-utils'
import { expect } from 'chai'
import sinon from 'sinon'
import fetchPonyfill from 'fetch-ponyfill'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import Indexing from '@/components/Indexing'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'
import { datashare } from '@/store/modules/indexing'
import { DatashareClient } from '@/api/DatashareClient'

const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})

describe('Indexing.vue', () => {
  var wrapped = null

  beforeEach(() => {
    wrapped = mount(Indexing, {localVue, i18n, router, store})
    sinon.stub(datashare, 'fetch')
  })

  afterEach(() => {
    datashare.fetch.restore()
    wrapped.vm.$store.commit('indexing/reset')
  })

  it('should begin/stop polling when route enter/leave', async () => {
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

  it('should call index as default action', async () => {
    datashare.fetch.returns(jsonOk({}))
    store.dispatch('indexing/query')
    await wrapped.vm.$nextTick()

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call index when index action is selected', async () => {
    datashare.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})

    store.dispatch('indexing/query')
    await wrapped.vm.$nextTick()

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call findNames when selected action is findNames', async () => {
    datashare.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    store.commit('indexing/updateField', {path: 'form.pipeline', value: 'PIPELINE'})

    store.dispatch('indexing/query')

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/PIPELINE'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should set corenlp as default pipeline', async () => {
    datashare.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})

    store.dispatch('indexing/query')

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should disable resume if selected action is findNames', () => {
    datashare.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    store.commit('indexing/updateField', {path: 'form.pipeline', value: 'PIPELINE'})

    store.dispatch('indexing/query')

    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/PIPELINE'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should call index action with ocr option', () => {
    datashare.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})
    store.commit('indexing/updateField', {path: 'form.ocr', value: true})

    store.dispatch('indexing/query')

    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: true}}), credentials: 'same-origin'})
  })

  it('should display ocr option if selected action is index', () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})
    expect(wrapped.vm.$el.querySelectorAll('input#ocr').length).to.equal(1)
  })

  it('should hide ocr option if selected action is not index', () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    expect(wrapped.vm.$el.querySelectorAll('input#ocr').length).to.equal(0)
  })

  it('should display pipeline choice if selected action is findNames', () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    expect(wrapped.vm.$el.querySelectorAll('select#pipeline').length).to.equal(1)
  })

  it('should hide pipeline choice if selected action is not findNames', () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})
    expect(wrapped.vm.$el.querySelectorAll('select#pipeline').length).to.equal(0)
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
