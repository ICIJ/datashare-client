import store from '@/store'

describe('store', () => {
  it('should instanciate an object', () => {
    expect(store).toBeInstanceOf(Object)
  })

  it('should be in strict mode', () => {
    expect(store.strict).toEqual(true)
  })

  it('should define an aggregation module', () => {
    expect(store.state.aggregation).toBeDefined()
  })

  it('should define a search module', () => {
    expect(store.state.search).toBeDefined()
  })

  it('should define an indexing module', () => {
    expect(store.state.indexing).toBeDefined()
  })

  it('should define a document module', () => {
    expect(store.state.document).toBeDefined()
  })
})
