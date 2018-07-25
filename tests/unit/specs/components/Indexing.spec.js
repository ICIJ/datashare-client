import { createLocalVue, mount } from '@vue/test-utils'
import Indexing from '@/components/Indexing'

import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const i18n = new VueI18n({locale: 'en', messages})

describe('Indexing.vue', () => {
  var wrapped = null

  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(Indexing, {i18n, router, store})
    sinon.stub(window, 'fetch')
  })

  afterEach(() => {
    window.fetch.restore()
    wrapped.vm.$store.commit('indexing/reset')
  })

  it('should begin/stop polling when route enter/leave', async () => {
    router.push('indexing')
    expect(wrapped.vm.$store.state.indexing.pollHandle).to.not.equal(undefined)

    router.push('/')
    expect(wrapped.vm.$store.state.indexing.pollHandle).to.equal(null)
  })

  it('should update tasks with polling request', async () => {
    window.fetch.returns(jsonOk({}))
    wrapped.vm.$store.commit('indexing/updateTasks', [{name: 'foo.bar@123', progress: 0.5, state: 'DONE'},
      {name: 'foo.baz@456', progress: 0.2, state: 'RUNNING'}])
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks').length).to.equal(2)
    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks')[0].textContent).to.contain('bar(123)')
    expect(wrapped.vm.$el.querySelectorAll('li.indexing__tasks')[1].textContent).to.contain('baz(456)')
  })

  it('should call index as default action', async () => {
    window.fetch.returns(jsonOk({}))
    store.dispatch('indexing/query')
    await Vue.nextTick()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/index/file',
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call index when index action is selected', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})

    store.dispatch('indexing/query')
    await Vue.nextTick()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/index/file',
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
  })

  it('should call findNames when selected action is findNames', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    store.commit('indexing/updateField', {path: 'form.pipeline', value: 'PIPELINE'})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/findNames/PIPELINE',
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should set corenlp as default pipeline', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/findNames/CORENLP',
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should disable resume if selected action is findNames', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    store.commit('indexing/updateField', {path: 'form.pipeline', value: 'PIPELINE'})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledWith(window.fetch, '/api/task/findNames/PIPELINE',
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should call index action with ocr option', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})
    store.commit('indexing/updateField', {path: 'form.ocr', value: true})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/index/file',
      {method: 'POST', body: JSON.stringify({options: {ocr: true}}), credentials: 'same-origin'})
  })

  it('should display ocr option if selected action is index', async () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})
    wrapped.update()
    expect(wrapped.vm.$el.querySelectorAll('input#ocr').length).to.equal(1)
  })

  it('should hide ocr option if selected action is not index', async () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    wrapped.update()
    expect(wrapped.vm.$el.querySelectorAll('input#ocr').length).to.equal(0)
  })

  it('should display pipeline choice if selected action is findNames', async () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'findNames'})
    wrapped.update()
    expect(wrapped.vm.$el.querySelectorAll('select#pipeline').length).to.equal(1)
  })

  it('should hide pipeline choice if selected action is not findNames', async () => {
    store.commit('indexing/updateField', {path: 'form.action', value: 'index'})
    wrapped.update()
    expect(wrapped.vm.$el.querySelectorAll('select#pipeline').length).to.equal(0)
  })
})

function jsonOk (body) {
  const mockResponse = new window.Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json'
    }
  })
  return Promise.resolve(mockResponse)
}
