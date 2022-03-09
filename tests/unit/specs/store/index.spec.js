import store from '@/store'

describe('store', () => {
  it('should instantiate an object', () => {
    expect(store).toBeInstanceOf(Object)
  })

  it('shouldn\'t be in strict mode', () => {
    expect(store.strict).toBeFalsy()
  })

  it('should define a batchSearch module', () => {
    expect(store.state.batchSearch).toBeDefined()
  })

  it('should define a settings module', () => {
    expect(store.state.settings).toBeDefined()
  })

  it('should define a document module', () => {
    expect(store.state.document).toBeDefined()
  })

  it('should define a downloads module', () => {
    expect(store.state.downloads).toBeDefined()
  })

  it('should define an indexing module', () => {
    expect(store.state.indexing).toBeDefined()
  })

  it('should define a recommended module', () => {
    expect(store.state.recommended).toBeDefined()
  })

  it('should define a search module', () => {
    expect(store.state.search).toBeDefined()
  })

  it('should define a treeView module', () => {
    expect(store.state.treeView).toBeDefined()
  })
})
