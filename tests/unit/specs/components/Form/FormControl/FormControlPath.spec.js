import { flushPromises, mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlPath from '@/components/Form/FormControl/FormControlPath'
import PathTree from '@/components/PathTree/PathTree'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
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
    const AppModal = { name: 'AppModal', template: '<div><slot /></div>' }
    const stubs = { AppModal, PathTree: true, PathTreeBreadcrumb: true }
    const defaults = { path: '/vault/foo', modelValue: '/vault/foo', projects: ['foo'] }
    return mount(FormControlPath, { props: { ...defaults, ...props }, global: { plugins: core.plugins, stubs } })
  }

  async function browse(wrapper) {
    const button = wrapper.findAllComponents(ButtonIcon)[0]
    await button.trigger('click')
    await flushPromises()
  }

  async function ok(wrapper) {
    const modal = wrapper.findComponent({ name: 'AppModal' })
    modal.vm.$emit('ok')
    await flushPromises()
  }

  const notFound = { response: { status: 404 } }

  function onDisk(...paths) {
    api.tree.mockImplementation(async (path) => {
      if (!paths.includes(path)) {
        throw notFound
      }
      return {}
    })
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

  it('opens on the saved path when the disk check fails for another reason', async () => {
    api.tree.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/vault/foo')
    expect(api.elasticsearch.getCommonDirname).not.toBeCalled()
  })

  it('opens on the indexed folder when the saved path is missing', async () => {
    onDisk('/data/leak')
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data/leak')
  })

  it('keeps the value when the user closes the modal without confirming', async () => {
    onDisk('/data/leak')
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath()
    await browse(wrapper)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('uses the indexed folder when the user confirms without a selection', async () => {
    onDisk('/data/leak')
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath()
    await browse(wrapper)
    await ok(wrapper)
    expect(wrapper.emitted('update:modelValue')).toEqual([['/data/leak']])
  })

  it('uses the indexed folder when the user confirms after a project switch', async () => {
    onDisk('/data/leak')
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath()
    await wrapper.setProps({ projects: ['bar'], path: '/vault/bar', modelValue: '/vault/bar' })
    await browse(wrapper)
    await ok(wrapper)
    expect(wrapper.emitted('update:modelValue')).toEqual([['/data/leak']])
  })

  it('uses the folder the user picks after a project switch', async () => {
    onDisk('/data/leak')
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath()
    await wrapper.setProps({ path: '/vault/bar', modelValue: '/vault/bar', projects: ['bar'] })
    await browse(wrapper)
    wrapper.findComponent(PathTree).vm.$emit('update:selectedPaths', ['/data/leak/a'])
    await ok(wrapper)
    expect(wrapper.emitted('update:modelValue')).toEqual([['/data/leak/a']])
  })

  it('keeps the value when the user confirms and nothing is indexed', async () => {
    onDisk()
    api.elasticsearch.getCommonDirname.mockResolvedValue(null)
    const wrapper = mountPath()
    await browse(wrapper)
    await ok(wrapper)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps the saved path when the user confirms without a selection', async () => {
    onDisk('/vault/foo')
    const wrapper = mountPath()
    await browse(wrapper)
    await ok(wrapper)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps the value when the user confirms before the root resolves', async () => {
    api.tree.mockReturnValue(new Promise(() => {}))
    const wrapper = mountPath()
    await browse(wrapper)
    await ok(wrapper)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('opens on the data dir when the indexed folder is missing on disk', async () => {
    onDisk()
    api.elasticsearch.getCommonDirname.mockResolvedValue('/home/datashare/data/leak')
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data')
  })

  it('opens on the data dir when the indexed documents share no folder', async () => {
    onDisk('/')
    api.elasticsearch.getCommonDirname.mockResolvedValue('/')
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data')
  })

  it('resolves the root again when the path changes while the picker is open', async () => {
    onDisk('/data/leak', '/vault/bar')
    let resolveLookup
    api.elasticsearch.getCommonDirname.mockReturnValue(new Promise(resolve => resolveLookup = resolve))
    const wrapper = mountPath()
    await browse(wrapper)
    await wrapper.setProps({ path: '/vault/bar', projects: ['bar'] })
    await flushPromises()
    resolveLookup('/data/leak')
    await flushPromises()
    expect(treePath(wrapper)).toBe('/vault/bar')
  })

  it('keeps the root when the parent passes the same projects again', async () => {
    onDisk('/data/leak')
    let resolveLookup
    api.elasticsearch.getCommonDirname.mockReturnValue(new Promise(resolve => resolveLookup = resolve))
    const wrapper = mountPath()
    await browse(wrapper)
    await wrapper.setProps({ projects: ['foo'] })
    resolveLookup('/data/leak')
    await flushPromises()
    expect(treePath(wrapper)).toBe('/data/leak')
  })

  it('shows a spinner while the root resolves', async () => {
    api.tree.mockReturnValue(new Promise(() => {}))
    const wrapper = mountPath()
    await browse(wrapper)
    expect(wrapper.findComponent(AppSpinner).exists()).toBe(true)
  })

  it('hides the previous tree while the root resolves again', async () => {
    api.tree.mockResolvedValue({})
    const wrapper = mountPath()
    await browse(wrapper)
    api.tree.mockReturnValue(new Promise(() => {}))
    await browse(wrapper)
    expect(wrapper.findComponent(PathTree).exists()).toBe(false)
  })

  it('shows the indexed folders in the tree when asked', async () => {
    api.tree.mockResolvedValue({})
    const wrapper = mountPath({ indexed: true })
    await browse(wrapper)
    expect(wrapper.findComponent(PathTree).props('projects')).toEqual(['foo'])
  })

  it('shows every folder level in the tree', async () => {
    api.tree.mockResolvedValue({})
    const wrapper = mountPath()
    await browse(wrapper)
    expect(wrapper.findComponent(PathTree).props('noFold')).toBe(true)
  })

  it('shows only folders on disk in the tree', async () => {
    api.tree.mockResolvedValue({})
    const wrapper = mountPath()
    await browse(wrapper)
    expect(wrapper.findComponent(PathTree).props('projects')).toEqual([])
  })

  it('opens on the data dir when the saved path is missing and nothing is indexed', async () => {
    api.tree.mockRejectedValue(notFound)
    api.elasticsearch.getCommonDirname.mockResolvedValue(null)
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data')
  })

  it('opens on the data dir when the saved path is missing and the indexed folder cannot be found', async () => {
    api.tree.mockRejectedValue(notFound)
    api.elasticsearch.getCommonDirname.mockRejectedValue(new Error('401'))
    const wrapper = mountPath()
    await browse(wrapper)
    expect(treePath(wrapper)).toBe('/data')
  })

  it('keeps a folder the user already picked', async () => {
    api.tree.mockRejectedValue(notFound)
    api.elasticsearch.getCommonDirname.mockResolvedValue('/data/leak')
    const wrapper = mountPath({ modelValue: '/elsewhere' })
    await browse(wrapper)
    await ok(wrapper)
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
