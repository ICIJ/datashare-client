import axios from 'axios'
import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'

import { createCore } from '@/core'

jest.mock('axios', () => {
  return {
    get: jest.fn().mockResolvedValue({ data: {} }),
    request: jest.fn().mockResolvedValue({ data: { userProjects: ['first-index'] } })
  }
})

describe('main', () => {
  beforeEach(() => {
    const core = document.createElement('div')
    core.setAttribute('id', 'core')
    document.body.appendChild(core)
  })

  it('should instantiate Vue', async () => {
    const core = createCore(createLocalVue())
    const vm = await core.ready.then(() => core.mount())
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    axios.request.mockReturnValue({ data: { userProjects: ['first-index'], key: 'value' } })
    const core = createCore(createLocalVue())
    const vm = await core.ready.then(() => core.mount())
    expect(vm.$config).toBeDefined()
    expect(vm.$config.get('userProjects')).toEqual(['first-index'])
    expect(vm.$config.get('key')).toEqual('value')
  })

  it('should find several hooked components by their target name', async () => {
    const core = createCore(createLocalVue())
    await core.ready.then(() => core.mount())
    core.resetHooks()
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(core.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', async () => {
    const core = createCore(createLocalVue())
    await core.ready.then(() => core.mount())
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
