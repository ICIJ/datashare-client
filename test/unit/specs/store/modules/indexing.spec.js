import Vuex from 'vuex'
import { actions, getters, mutations, state } from '@/store/modules/indexing'

describe('Indexing store', () => {
  var store = null

  before(() => {
    store = new Vuex.Store({ actions, getters, mutations, state })
  })

  afterEach(() => store.commit('clear'))

  it('should define a store module', () => {
    expect(store.state).to.not.equal(undefined)
  })

  it('should reset properties to it default values', () => {
    store.commit('clear')

    expect(store.state.form.action).to.equal('index')
    expect(store.state.form.path).to.equal('/home/datashare/data')
    expect(store.state.form.pipeline).to.equal('CORENLP')
    expect(store.state.form.ocr).to.equal(false)
    expect(store.state.pollHandle).to.equal(null)
  })

  it('should clear running jobs', async () => {
    await store.dispatch('stopPollTasks')
    expect(store.state.pollHandle).to.equal(null)
  })
})
