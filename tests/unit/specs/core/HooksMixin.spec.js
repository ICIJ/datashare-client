import { createLocalVue } from '@vue/test-utils'
import { Core } from '@/core'

describe('HooksMixin', () => {
  let core

  beforeEach(async () => {
    core = Core.init(createLocalVue()).useAll()
    core.store.commit('hooks/reset')
  })

  it('should find several hooked components by their target name', async () => {
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', async () => {
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
    core.resetHook('baz')
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(0)
  })

  it('should find one hooked components by its target name on the current project', async () => {
    core.registerHookForProject('first-index', { target: 'foo' })
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(0)
    core.store.commit('search/indices', 'first-index')
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
  })

  it('should find no hooked components on the current project', async () => {
    core.registerHookForProject('first-index', { target: 'baz' })
    core.store.commit('search/indices', 'first-index')
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(1)
    core.store.commit('search/indices', 'second-index')
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(0)
  })

  it('should reset all hooks', async () => {
    core.registerHook({ target: 'bar' })
    core.registerHook({ target: 'bar' })
    core.resetHooks()
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(0)
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(0)
  })
})
