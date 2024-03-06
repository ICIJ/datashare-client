import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'

import { createCore } from '@/core'

describe('main', () => {
  const { localVue } = createLocalVue()
  let core = null
  let vm = null
  let api = null

  beforeAll(() => {
    api = {
      getUser: vi.fn(),
      getSettings: vi.fn(),
      getProject: vi.fn()
    }
    api.getSettings.mockResolvedValue({})
    api.getProject.mockResolvedValue({})
  })

  beforeEach(async () => {
    api.getUser.mockClear()
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    core = createCore(localVue, api)
    vm = await core.ready
    vm = vm.mount()
  })

  it('should instantiate Vue', () => {
    api.getUser.mockResolvedValue({})
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    api.getUser.mockResolvedValue({ userProjects: ['first-index'], key: 'value' })
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    core = createCore(localVue, api)
    vm = await core.ready
    vm = await vm.mount()
    expect(vm.$config).toBeDefined()
    expect(vm.$config.get('userProjects')).toEqual(['first-index'])
    expect(vm.$config.get('key')).toBe('value')
  })

  it('should find several hooked components by their target name', () => {
    core.resetHooks()
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', () => {
    core.resetHooks()
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
    core.resetHook('baz')
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('foo')).toHaveLength(1)
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(0)
  })
})
