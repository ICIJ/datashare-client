import Vuex from 'vuex'
import { actions, getters, mutations, state } from '@/store/modules/indexing'

describe('Indexing store', () => {
  var store = null

  before(() => {
    store = new Vuex.Store({ actions, getters, mutations, state })
  })

  beforeEach(() => {
    store.commit('clear')
  })

  it('should define a store module', () => {
    expect(store.state).to.not.equal(undefined)
  })

  it('should set CORENLP as default pipeline', () => {
    expect(store.state.form.pipeline).to.equal('CORENLP')
  })

  it('should clear running jobs', async () => {
    await store.dispatch('stopPollTasks')
    expect(store.state.pollHandle).to.equal(null)
  })
})
