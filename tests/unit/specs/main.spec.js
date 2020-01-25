import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'
import { createApp } from '@/main'
import { jsonResp } from 'tests/unit/tests_utils'

describe('main', () => {
  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    window.fetch = jest.fn()
    window.fetch.mockReturnValue(jsonResp({ userProjects: ['first-index'] }))
  })

  afterEach(() => window.fetch.mockRestore())

  it('should instantiate Vue', async () => {
    const { app, vm } = createApp(createLocalVue())
    await app.ready
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    window.fetch.mockReturnValue(jsonResp({ userProjects: ['first-index'], key: 'value' }))
    const { app, vm } = createApp(createLocalVue())
    await app.ready
    expect(vm.$config).toBeDefined()
    expect(vm.$config.get('userProjects')).toEqual(['first-index'])
    expect(vm.$config.get('key')).toEqual('value')
  })

  it('should find several hooked components by their target name', () => {
    const { app } = createApp(createLocalVue())
    app.resetHooks()
    app.registerHook({ target: 'foo' })
    app.registerHook({ target: 'baz' })
    app.registerHook({ target: 'baz' })
    expect(app.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', () => {
    const { app } = createApp(createLocalVue())
    app.resetHooks()
    app.registerHook({ target: 'foo' })
    app.registerHook({ target: 'baz' })
    app.registerHook({ target: 'baz' })
    expect(app.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
    expect(app.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
    app.resetHook('baz')
    expect(app.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
    expect(app.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(0)
  })
})
