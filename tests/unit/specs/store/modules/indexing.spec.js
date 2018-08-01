import Vuex from 'vuex'
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { expect } from 'chai'
import sinon from 'sinon'
import fetchPonyfill from 'fetch-ponyfill'

import DatashareClient from '@/api/DatashareClient'
import { actions, getters, mutations, state, datashare } from '@/store/modules/indexing'

const { Response } = fetchPonyfill()
Vue.use(Vuex)

describe('Indexing store', () => {
  let store = null

  beforeAll(async () => {
    store = new Vuex.Store({ actions, getters, mutations, state })
  })

  beforeEach(() => {
    sinon.stub(datashare, 'fetch')
  })

  afterEach(async () => {
    store.commit('reset')
    datashare.fetch.restore()
  })

  it('should define a store module', () => {
    expect(store.state).to.not.equal(undefined)
  })

  it('should reset the store state', async () => {
    let initialState = cloneDeep(store.state)
    await store.commit('reset')

    expect(store.state).to.deep.equal(initialState)
  })

  it('should execute an empty query', async () => {
    fetchReturns(200, {})
    await store.dispatch('query')
    sinon.assert.callCount(datashare.fetch, 0)
  })

  it('should execute an empty query', async () => {
    await store.dispatch('query')
    sinon.assert.callCount(datashare.fetch, 0)
  })

  it('should execute a complex query', async () => {
    fetchReturns(200, {})
    store.state.form.index = true
    store.state.form.findNames = true
    store.state.form.pipeline_corenlp = true
    store.state.form.pipeline_opennlp = true
    store.state.form.pipeline_mitie = false
    store.state.form.pipeline_ixapipe = true
    store.state.form.pipeline_gatenlp = true

    await store.dispatch('query')

    sinon.assert.callCount(datashare.fetch, 5)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/IXAPIPE'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/findNames/GATENLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should clear running jobs', async () => {
    fetchReturns(200, {})
    await store.dispatch('cleanTasks')
    expect(store.state.tasks).to.deep.equal([])
    sinon.assert.calledOnce(datashare.fetch)
    sinon.assert.calledWith(datashare.fetch, DatashareClient.getFullUrl('/api/task/clean/'),
      {method: 'POST', body: '{}', credentials: 'same-origin'})
  })

  it('should stop polling jobs', async () => {
    await store.dispatch('stopPollTasks')
    expect(store.state.pollHandle).to.equal(null)
  })
})

function fetchReturns (status, json) {
  datashare.fetch.returns(Promise.resolve(new Response(JSON.stringify(json), {
    status: status,
    headers: {
      'Content-type': 'application/json'
    }
  })))
}
