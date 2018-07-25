import Vuex from 'vuex'
import { state, actions, mutations } from '@/store/modules/document'
import cloneDeep from 'lodash/cloneDeep'

describe('Document store', () => {
  let store = null

  before(async () => {
    store = new Vuex.Store({ state, actions, mutations })
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
})
