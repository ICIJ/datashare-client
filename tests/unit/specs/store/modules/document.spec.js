import cloneDeep from 'lodash/cloneDeep'
import { expect } from 'chai'

import store from '@/store'
import { initialState } from '@/store/modules/document'

describe('Document store', () => {
  afterEach(async () => store.commit('document/reset'))

  it('should define a store module', () => {
    expect(store.state.document).to.not.equal(undefined)
  })

  it('should reset the store state', async () => {
    await store.commit('document/reset')
    expect(store.state.document).to.deep.equal(initialState())
  })
})
