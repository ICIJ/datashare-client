import {createLocalVue, mount} from 'vue-test-utils'
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

  beforeEach(async () => {
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    wrapped = mount(Indexing, {i18n, router, store})
    sinon.stub(window, 'fetch')
  })
  afterEach(() => {
    window.fetch.restore()
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

  it('should call index when index is selected', async () => {
    window.fetch.returns(jsonOk({}))
    store.dispatch('indexing/query')
    await Vue.nextTick()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/task/index/file/%7Chome%7Cdatashare%7Cdata', {method: 'POST', body: JSON.stringify({options: {enableOcr: false}})})
  })

  it('should call extract when extract is selected', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.index', value: false})
    store.commit('indexing/updateField', {path: 'form.extract', value: true})
    store.commit('indexing/updateField', {path: 'form.pipeline', value: 'PIPELINE'})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/task/extract/PIPELINE', {method: 'POST', body: '{}'})
  })

  it('should call index with ocr option', async () => {
    window.fetch.returns(jsonOk({}))
    store.commit('indexing/updateField', {path: 'form.index', value: true})
    store.commit('indexing/updateField', {path: 'form.extract', value: false})
    store.commit('indexing/updateField', {path: 'form.enableOcr', value: true})

    store.dispatch('indexing/query')
    wrapped.update()

    sinon.assert.calledOnce(window.fetch)
    sinon.assert.calledWith(window.fetch, '/task/index/file/%7Chome%7Cdatashare%7Cdata', {method: 'POST', body: JSON.stringify({options: {enableOcr: true}})})
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
