import store from '@/store'

describe('store', () => {
  it('should instantiate an object', () => {
    expect(store).toBeInstanceOf(Object)
  })

  it("shouldn't be in strict mode", () => {
    expect(store.strict).toBeFalsy()
  })

  it('should define a batchSearch module', () => {
    expect(store.state.batchSearch).toBeDefined()
  })
})
