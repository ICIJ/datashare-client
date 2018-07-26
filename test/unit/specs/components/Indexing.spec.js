import { createLocalVue, mount } from 'vue-test-utils'
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
    sinon.stub(window, 'fetch')
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(Indexing, {i18n, router, store})
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

  it('should call index when index action is selected', () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', { path: 'form.index', value: true })

    store.dispatch('indexing/query')

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/index/file',
      {method: 'POST', body: JSON.stringify({options: {ocr: 0}}), credentials: 'same-origin'})
  })

  it('should call findNames when selected action is findNames with the correct pipeline', () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', { path: 'form.findNames', value: true })
    store.commit('indexing/updateField', { path: 'form.pipeline_corenlp', value: true })

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/findNames/CORENLP',
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should call index action with ocr option', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.index', value: true})
    store.commit('indexing/updateField', {path: 'form.ocr', value: 1})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/api/task/index/file',
      {method: 'POST', body: JSON.stringify({options: {ocr: 1}}), credentials: 'same-origin'})
  })

  it('should set first step as default step', () => {
    expect(wrapped.vm.step).to.equal(1)
    expect(wrapped.vm.errors.length).to.equal(0)
  })

  it('should diplay an error message', async () => {
    window.fetch.returns(jsonOk({}))
    await wrapped.vm.next()
    await Vue.nextTick()
    expect(wrapped.vm.errors.length).to.equal(1)
    expect(wrapped.vm.step).to.equal(1)
  })

  it('should diplay the second step of the wizard', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.index', value: true})
    await wrapped.vm.next()
    await Vue.nextTick()
    expect(wrapped.vm.step).to.equal(2)
    expect(wrapped.vm.errors.length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_02').length).to.equal(1)
    expect(wrapped.vm.ocr).to.equal(0)
  })

  it('should display the third step of the wizard', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.findNames', value: true})
    await wrapped.vm.next()
    await Vue.nextTick()
    expect(wrapped.vm.step).to.equal(3)
    expect(wrapped.vm.errors.length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_03').length).to.equal(1)
  })

  it('should display an error if no NLP pipeline is choosen', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.findNames', value: true})
    await wrapped.vm.next()
    await wrapped.vm.next()
    await Vue.nextTick()
    expect(wrapped.vm.step).to.equal(3)
    expect(wrapped.vm.errors.length).to.equal(1)
  })

  it('should display the last and final step', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.index', value: true})
    store.commit('indexing/updateField', {path: 'form.findNames', value: true})
    store.commit('indexing/updateField', {path: 'form.pipeline_opennlp', value: true})
    await wrapped.vm.next()
    await wrapped.vm.next()
    await wrapped.vm.next()
    await Vue.nextTick()
    expect(wrapped.vm.step).to.equal(4)
    expect(wrapped.vm.errors.length).to.equal(0)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_04').length).to.equal(1)
    expect(wrapped.vm.$el.querySelectorAll('.indexing__form__step_04 button[type=submit]').length).to.equal(1)
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
