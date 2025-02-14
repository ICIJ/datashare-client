import { createCore } from '@/core'
import { useHooksStore } from '@/store/modules/hooks'

describe('main', () => {
  let core, vm, api, hooksStore

  function createContainer() {
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    return app
  }

  beforeAll(() => {
    api = { getUser: vi.fn(), getSettings: vi.fn(), getProject: vi.fn() }
    api.getSettings.mockResolvedValue({})
    api.getProject.mockResolvedValue({})
  })

  beforeEach(async () => {
    api.getUser.mockClear()
    document.body.appendChild(createContainer())
    core = createCore(api)
    hooksStore = useHooksStore()
    vm = await core.ready
    vm = vm.useRouter().mount()
  })

  it('should instantiate Vue', () => {
    api.getUser.mockResolvedValue({})
    expect(core.vue).toBeInstanceOf(Object)
    expect(vm.config.globalProperties.$router).toBeDefined()
    expect(vm.config.globalProperties.$store).toBeDefined()
  })

  it('should set the config', async () => {
    api.getUser.mockResolvedValue({ userProjects: ['first-index'], key: 'value' })
    const app = document.createElement('div')
    app.setAttribute('id', 'app')
    document.body.appendChild(app)
    core = createCore(api)
    vm = await core.ready
    vm = await vm.useRouter().mount()
    expect(vm.config.globalProperties.$config).toBeDefined()
    expect(vm.config.globalProperties.$config.get('userProjects')).toEqual(['first-index'])
    expect(vm.config.globalProperties.$config.get('key')).toBe('value')
  })

  it('should find several hooked components by their target name', () => {
    core.resetHooks()
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(2)
  })

  it('should unregister all components on a hook', () => {
    core.resetHooks()
    core.registerHook({ target: 'foo' })
    core.registerHook({ target: 'baz' })
    core.registerHook({ target: 'baz' })
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(2)
    core.resetHook('baz')
    expect(hooksStore.filterComponentsByTarget('foo')).toHaveLength(1)
    expect(hooksStore.filterComponentsByTarget('baz')).toHaveLength(0)
  })
})
