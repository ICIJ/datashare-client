import axios from 'axios'
import Vue from 'vue'
import { createLocalVue } from '@vue/test-utils'

import { createApp } from '@/main'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: { userProjects: ['first-index'] } }),
    get: jest.fn().mockReturnValue({ data: {}, status: 401 })
  }
})

describe('main', () => {
  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
  })

  it('should instantiate Vue', async () => {
    const app = createApp(createLocalVue())
    const vm = await app.ready.then(() => app.mount())
    expect(vm).toBeInstanceOf(Vue)
    expect(vm.$router).toBeDefined()
    expect(vm.$store).toBeDefined()
  })

  it('should set the config', async () => {
    axios.request.mockReturnValue({ data: { userProjects: ['first-index'], key: 'value' } })
    const app = createApp(createLocalVue())
    const vm = await app.ready.then(() => app.mount())
    expect(vm.$config).toBeDefined()
    expect(vm.$config.get('userProjects')).toEqual(['first-index'])
    expect(vm.$config.get('key')).toEqual('value')
  })

  it('should find several hooked components by their target name', async () => {
    const app = createApp(createLocalVue())
    await app.ready.then(() => app.mount())
    app.resetHooks()
    app.registerHook({ target: 'foo' })
    app.registerHook({ target: 'baz' })
    app.registerHook({ target: 'baz' })
    expect(app.store.getters['hooks/filterHookedComponentsByTarget']('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', async () => {
    const app = createApp(createLocalVue())
    await app.ready.then(() => app.mount())
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
