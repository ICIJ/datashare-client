import store from '@/store'

describe('store', () => {
  it('should instantiate an object', () => {
    expect(store).toBeInstanceOf(Object)
  })

  it('should be in strict mode', () => {
    expect(store.strict).toEqual(true)
  })

  it('should define a batchSearch module', () => {
    expect(store.state.batchSearch).toBeDefined()
  })

  it('should define a config module', () => {
    expect(store.state.config).toBeDefined()
  })

  it('should define a document module', () => {
    expect(store.state.document).toBeDefined()
  })

  it('should define an indexing module', () => {
    expect(store.state.indexing).toBeDefined()
  })

  it('should define a search module', () => {
    expect(store.state.search).toBeDefined()
  })

  it('should define a treeView module', () => {
    expect(store.state.treeView).toBeDefined()
  })

  it('should define a userHistory module', () => {
    expect(store.state.userHistory).toBeDefined()
  })
})
