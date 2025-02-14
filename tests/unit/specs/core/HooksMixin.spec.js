import { Core } from '@/core'
import { useHooksStore } from '@/store/modules/hooks'

describe('HooksMixin', () => {
  let core, hooksStore

  beforeEach(async () => {
    core = Core.init().useAll()
    hooksStore = useHooksStore()
  })

  afterEach(() => {
    hooksStore.reset()
  })

  it('should find several hooked components by their target name', async () => {
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', async () => {
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(2)
    core.resetHook('baz')
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(0)
  })

  it('should find one hooked components by its target name on the current project', async () => {
    core.registerHookForProject('first-index', { target: 'foo' })
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(0)
    core.store.commit('search/indices', 'first-index')
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
  })

  it('should find no hooked components on the current project', async () => {
    core.registerHookForProject('first-index', { target: 'baz' })
    core.store.commit('search/indices', 'first-index')
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(1)
    core.store.commit('search/indices', 'second-index')
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(0)
  })

  it('should reset all hooks', async () => {
    core.registerHook({ target: 'bar' })
    core.registerHook({ target: 'bar' })
    core.resetHooks()
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(0)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(0)
  })
})
