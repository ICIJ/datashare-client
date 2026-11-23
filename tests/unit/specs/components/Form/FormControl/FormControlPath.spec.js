import { flushPromises, mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import PathTree from '@/components/PathTree/PathTree'
import { apiInstance as api } from '@/api/apiInstance'
import { MODE_NAME } from '@/mode'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      tree: vi.fn(),
      elasticsearch: { getCommonDirname: vi.fn() }
    }
  }
})

describe('FormControlPath.vue', () => {
  let core

  function mountPath(props = {}) {
    const stubs = { AppModal: { template: '<div><slot /></div>' }, PathTree: true, PathTreeBreadcrumb: true }
    const defaults = { path: '/vault/foo', modelValue: '/vault/foo', projects: ['foo'] }
    return mount(FormControlPath, { props: { ...defaults, ...props }, global: { plugins: core.plugins, stubs } })
  }

  async function browse(wrapper) {
    const button = wrapper.findAllComponents(ButtonIcon)[0]
    await button.trigger('click')
    await flushPromises()
  }

  function treePath(wrapper) {
    return wrapper.findComponent(PathTree).props('path')
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    core = CoreSetup.init().createPinia().useAll()
    await core.config.set('dataDir', '/data')
    await core.config.set('mode', MODE_NAME.LOCAL)
  })

  it('opens on the saved path when it exists on disk', async () => {
    api.tree.mockResolvedValue({})
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/vault/foo')
    expect(api.elasticsearch.getCommonDirname).not.toBeCalled()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('opens on the indexed folder when the saved path is missing', async () => {
    api.tree.mockRejectedValue(new Error('404'))
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data/leak')
    expect(wrapper.emitted('update:modelValue')).toEqual([['/data/leak']])
  })

  it('opens on the data dir when the saved path is missing and nothing is indexed', async () => {
    api.tree.mockRejectedValue(new Error('404'))
    api.elasticsearch.getCommonDirname.mockResolvedValue(null)
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data')
  })

  it('keeps a folder the user already picked', async () => {
    api.tree.mockRejectedValue(new Error('404'))
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath({ modelValue: '/elsewhere' })
    await browse(wrapper)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps the saved path in server mode without checking the disk', async () => {
    await core.config.set('mode', MODE_NAME.SERVER)
    const wrapper = mountPath()
    await browse(wrapper)
    expect(api.tree).not.toBeCalled()
    expect(treePath(wrapper)).toBe('/vault/foo')
  })

  it('resolves the root again when the path changes', async () => {
    api.tree.mockResolvedValue({})
    const wrapper = mountPath()
    await browse(wrapper)
    await wrapper.setProps({ path: '/vault/bar' })
    await browse(wrapper)
    expect(api.tree).toHaveBeenLastCalledWith('/vault/bar')
  })

  it('leaves an empty value untouched without projects', async () => {
    const wrapper = mountPath({ path: null, modelValue: null, projects: [] })
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps the saved path without projects', async () => {
    const wrapper = mountPath({ projects: [] })
    await browse(wrapper)
    expect(api.tree).not.toBeCalled()
    expect(treePath(wrapper)).toBe('/vault/foo')
  })
})
