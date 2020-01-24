import store from '@/store'
import HookedComponent from '@/utils/hookedComponent'

describe('HooksStore', () => {
  beforeEach(() => {
    store.commit('hooks/reset')
  })

  it('should register hooked components', () => {
    store.commit('hooks/register', { target: 'foo' })
    store.commit('hooks/register', { target: 'bar' })
    expect(store.state.register).toHaveLength(2)
    store.commit('hooks/register', { target: 'baz' })
    expect(store.state.register).toHaveLength(3)
  })

  it('should register a hooked component', () => {
    store.commit('hooks/register', { target: 'foo' })
    expect(store.getters['hooks/hookedComponents']).toHaveLength(1)
    expect(store.getters['hooks/hookedComponents'][0] instanceof HookedComponent).toBeTruthy()
  })

  it('should find a hooked component by its target name', () => {
    store.commit('hooks/register', { target: 'foo' })
    store.commit('hooks/register', { target: 'bar' })
    expect(store.getters['hooks/filterHookedComponents']('foo')).toHaveLength(1)
  })

  it('should find several hooked components by their target name', () => {
    store.commit('hooks/register', { target: 'foo' })
    store.commit('hooks/register', { target: 'bar' })
    store.commit('hooks/register', { target: 'baz' })
    store.commit('hooks/register', { target: 'baz' })
    expect(store.getters['hooks/filterHookedComponents']('baz')).toHaveLength(2)
  })
})
