import Vuex from 'vuex'
import { actions, getters, mutations, state } from '@/store/modules/indexing'
import cloneDeep from 'lodash/cloneDeep'

describe('Indexing store', () => {
  let store = null

  before(async () => {
    store = new Vuex.Store({ actions, getters, mutations, state })
  })

  afterEach(async () => store.commit('reset'))

  it('should define a store module', () => {
    expect(store.state).to.not.equal(undefined)
  })

  it('should reset the store state', async () => {
    let initialState = cloneDeep(store.state)
    await store.commit('reset')

    expect(store.state).to.deep.equal(initialState)
  })

  it('should clear running jobs', async () => {
    await store.dispatch('stopPollTasks')
    expect(store.state.pollHandle).to.equal(null)
  })
})
