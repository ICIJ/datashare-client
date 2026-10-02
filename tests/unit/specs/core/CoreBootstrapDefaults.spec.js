import { Core } from '@/core/Core'

describe('Core bootstrap defaults', () => {
  const collectProvided = (plugin) => {
    const provided = {}
    plugin.install({ provide: (key, value) => (provided[key] = value), use: () => {} })
    return Reflect.ownKeys(provided).map(key => provided[key])
  }

  it('should make every popover open on click instead of hover', () => {
    const core = Core.init().useBootstrapVue()
    const [defaults] = collectProvided(core.bootstrapVue)
    expect(defaults?.value?.BPopover?.click).toBe(true)
  })
})
