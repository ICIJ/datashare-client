import Vuex from 'vuex'
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import fetchPonyfill from 'fetch-ponyfill'

import DatashareClient from '@/api/DatashareClient'
import { actions, getters, mutations, state, datashare } from '@/store/modules/indexing'

const { Response } = fetchPonyfill()
Vue.use(Vuex)

describe('Indexing store', () => {
  let store

  beforeAll(async () => {
    store = new Vuex.Store({ actions, getters, mutations, state })
  })

  beforeEach(() => {
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk({}))
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

  it('should execute a default extract action', async () => {
    await store.dispatch('submitExtract')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/index/file'),
      { method: 'POST', body: JSON.stringify({ options: { ocr: false } }), credentials: 'same-origin' })
  })

  it('should execute a default find named entities action', async () => {
    await store.dispatch('submitFindNamedEntities')

    expect(datashare.fetch).toHaveBeenCalledTimes(1)
    expect(datashare.fetch).toHaveBeenCalledWith(DatashareClient.getFullUrl('/api/task/findNames/CORENLP'),
      { method: 'POST', body: JSON.stringify({ options: { syncModels: true } }), credentials: 'same-origin' })
  })

  it('should clear running jobs', async () => {
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

  it('should reset the extracting form', async () => {
    store.state.form.ocr = true
    expect(store.state.form.ocr).toBeTruthy()

    await store.dispatch('resetExtractForm')
    expect(store.state.form.ocr).toBeFalsy()
  })

  it('should reset the Find Named Entities form', async () => {
    store.state.form.pipeline = 'opennlp'
    store.state.form.offline = true
    expect(store.state.form.pipeline).toEqual('opennlp')
    expect(store.state.form.offline).toBeTruthy()

    await store.dispatch('resetFindNamedEntitiesForm')
    expect(store.state.form.pipeline).toEqual('corenlp')
    expect(store.state.form.offline).toBeFalsy()
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
