import Vuex from 'vuex'
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
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
    jest.spyOn(datashare, 'fetch')
  })

  afterEach(async () => {
    datashare.fetch.mockClear()
    store.commit('reset')
  })

  it('should define a store module', () => {
    expect(store.state).not.toEqual(undefined)
  })

  it('should reset the store state', async () => {
    let initialState = cloneDeep(store.state)
    await store.commit('reset')

    expect(store.state).toEqual(initialState)
  })

  it('should execute an empty query', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    await store.dispatch('query')

    expect(datashare.fetch).toHaveBeenCalledTimes(0)
  })

  it('should execute a complex query', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    store.state.form.index = true
    store.state.form.findNames = true
    store.state.form.pipeline_corenlp = true
    store.state.form.pipeline_opennlp = true
    store.state.form.pipeline_mitie = false
    store.state.form.pipeline_ixapipe = true
    store.state.form.pipeline_gatenlp = true

    await store.dispatch('query')

    expect(datashare.fetch).toHaveBeenCalledTimes(5)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      {method: 'POST', body: JSON.stringify({options: {ocr: false}}), credentials: 'same-origin'})
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/findNames/OPENNLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/findNames/IXAPIPE'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/findNames/GATENLP'),
      {method: 'POST', body: JSON.stringify({options: {resume: true}}), credentials: 'same-origin'})
  })

  it('should clear running jobs', async () => {
    datashare.fetch.mockReturnValue(jsonOk({}))
    await store.dispatch('cleanTasks')
    expect(store.state.tasks).toEqual([])
    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/clean/'),
      {method: 'POST', body: '{}', credentials: 'same-origin'})
  })

  it('should stop polling jobs', async () => {
    await store.dispatch('stopPollTasks')
    expect(store.state.pollHandle).toBeNull()
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
