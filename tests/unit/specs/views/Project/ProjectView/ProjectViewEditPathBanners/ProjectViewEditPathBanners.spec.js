import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditPathBanners from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditPathBanners/ProjectViewEditPathBanners.vue'
import { apiInstance as api } from '@/api/apiInstance.js'
import { useDocumentNotesStore } from '@/store/modules/documentNotes.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    getPathBanners: vi.fn(),
    deletePathBanner: vi.fn()
  }
}))

const mockAfterConfirmation = vi.fn(fn => fn())
vi.mock('@/composables/useConfirmModal', () => ({
  useConfirmModal: () => ({ afterConfirmation: mockAfterConfirmation })
}))

describe('ProjectViewEditPathBanners.vue', () => {
  let core
  const props = { name: 'local-datashare' }

  const existingBanner = Object.freeze({
    note: 'Existing banner',
    variant: 'info',
    blurSensitiveMedia: false,
    path: '/data/docs',
    project: { name: 'local-datashare' }
  })

  function shallowMountComponent() {
    return shallowMount(ProjectViewEditPathBanners, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAfterConfirmation.mockImplementation(fn => fn())
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    api.getPathBanners.mockResolvedValue([])
    api.deletePathBanner.mockResolvedValue({})
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('fetches banners on mount', async () => {
    shallowMountComponent()
    await flushPromises()
    expect(api.getPathBanners).toBeCalledWith('local-datashare')
  })

  it('populates banners from API response', async () => {
    api.getPathBanners.mockResolvedValue([existingBanner])
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.vm.banners).toHaveLength(1)
    expect(wrapper.vm.banners[0]).toMatchObject(existingBanner)
  })

  it('renders an "Add banner" button', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.find('[data-testid="add-banner"]').exists()).toBe(true)
  })

  it('openCreateModal pushes to banners/new route', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    const push = vi.spyOn(core.router, 'push')
    wrapper.vm.openCreateModal()
    expect(push).toBeCalledWith(expect.objectContaining({ params: expect.objectContaining({ bannerId: 'new' }) }))
  })

  it('openEditModal pushes to banners route with the path hash', async () => {
    api.getPathBanners.mockResolvedValue([existingBanner])
    const wrapper = shallowMountComponent()
    await flushPromises()
    const push = vi.spyOn(core.router, 'push')
    wrapper.vm.openEditModal(0)
    const expectedHash = wrapper.vm.pathHash(existingBanner.path)
    expect(push).toBeCalledWith(expect.objectContaining({ params: expect.objectContaining({ bannerId: expectedHash }) }))
  })

  it('closeModal pushes to banners route without bannerId', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    const push = vi.spyOn(core.router, 'push')
    wrapper.vm.closeModal()
    expect(push).toBeCalledWith(expect.objectContaining({ params: expect.objectContaining({ bannerId: undefined }) }))
  })

  describe('delete', () => {
    it('asks for confirmation before deleting', async () => {
      api.getPathBanners.mockResolvedValue([existingBanner])
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.vm.confirmDeleteBanner(0)
      expect(mockAfterConfirmation).toHaveBeenCalledOnce()
    })

    it('calls deletePathBanner API when user confirms', async () => {
      api.getPathBanners.mockResolvedValue([existingBanner])
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.vm.confirmDeleteBanner(0)
      await flushPromises()
      expect(api.deletePathBanner).toBeCalledWith(existingBanner.project.name, existingBanner.path)
    })

    it('removes the banner from the list after confirmed deletion', async () => {
      api.getPathBanners.mockResolvedValue([existingBanner])
      const wrapper = shallowMountComponent()
      await flushPromises()
      expect(wrapper.vm.banners).toHaveLength(1)
      wrapper.vm.confirmDeleteBanner(0)
      await flushPromises()
      expect(wrapper.vm.banners).toHaveLength(0)
    })

    it('does not call deletePathBanner API when user cancels', async () => {
      mockAfterConfirmation.mockImplementation(() => {})
      api.getPathBanners.mockResolvedValue([existingBanner])
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.vm.confirmDeleteBanner(0)
      await flushPromises()
      expect(api.deletePathBanner).not.toHaveBeenCalled()
    })

    it('keeps the banner in the list when user cancels', async () => {
      mockAfterConfirmation.mockImplementation(() => {})
      api.getPathBanners.mockResolvedValue([existingBanner])
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.vm.confirmDeleteBanner(0)
      await flushPromises()
      expect(wrapper.vm.banners).toHaveLength(1)
    })
  })

  it('reloads banners when the modal emits banner:save', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(api.getPathBanners).toBeCalledTimes(1)
    const modal = wrapper.findComponent({ name: 'ProjectViewEditPathBannersModal' })
    await modal.vm.$emit('banner:save')
    await flushPromises()
    expect(api.getPathBanners).toBeCalledTimes(2)
  })

  it('selectedBanner is null when no bannerId in route', async () => {
    api.getPathBanners.mockResolvedValue([existingBanner])
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.vm.selectedBanner).toBeNull()
  })

  it('selectedBanner returns the banner matching the path hash in the route', async () => {
    api.getPathBanners.mockResolvedValue([existingBanner])
    const wrapper = shallowMountComponent()
    await flushPromises()
    const hash = wrapper.vm.pathHash(existingBanner.path)
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: hash } })
    await flushPromises()
    expect(wrapper.vm.selectedBanner).toMatchObject(existingBanner)
  })

  it('selectedBanner is null and closeModal is called when bannerId hash matches no banner', async () => {
    const wrapper = shallowMountComponent()
    await flushPromises()
    const push = vi.spyOn(core.router, 'push')
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'unknownhash' } })
    await flushPromises()
    expect(wrapper.vm.selectedBanner).toBeNull()
    expect(push).toBeCalledWith(expect.objectContaining({ params: expect.objectContaining({ bannerId: undefined }) }))
  })

  it('resolves the edit modal correctly when page is refreshed directly on an edit URL', async () => {
    api.getPathBanners.mockResolvedValue([existingBanner])
    const hash = existingBanner.path.split('').reduce((h, c) => {
      h = ((h << 5) + h) ^ c.charCodeAt(0)
      return h >>> 0
    }, 5381).toString(36)
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: hash } })
    await flushPromises()
    // mount AFTER the route is already set (simulates a hard refresh)
    const wrapper = shallowMountComponent()
    await flushPromises()
    expect(wrapper.vm.selectedBanner).toMatchObject(existingBanner)
  })

  describe('store invalidation', () => {
    it('syncs the notes store after loadBanners', async () => {
      api.getPathBanners.mockResolvedValue([existingBanner])
      shallowMountComponent()
      await flushPromises()
      const store = useDocumentNotesStore()
      expect(store.getNotes({ project: 'local-datashare' })).toHaveLength(1)
      expect(store.getNotes({ project: 'local-datashare' })[0]).toMatchObject(existingBanner)
    })

    it('syncs the notes store after a successful delete', async () => {
      api.getPathBanners.mockResolvedValue([existingBanner])
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.vm.confirmDeleteBanner(0)
      await flushPromises()
      const store = useDocumentNotesStore()
      expect(store.getNotes({ project: 'local-datashare' })).toHaveLength(0)
    })

    it('does not update the notes store when delete fails', async () => {
      api.getPathBanners.mockResolvedValue([existingBanner])
      api.deletePathBanner.mockRejectedValue(new Error('Server error'))
      const wrapper = shallowMountComponent()
      await flushPromises()
      wrapper.vm.confirmDeleteBanner(0)
      await flushPromises()
      const store = useDocumentNotesStore()
      expect(store.getNotes({ project: 'local-datashare' })).toHaveLength(1)
    })
  })

  describe('pathHash', () => {
    it('returns a non-empty string', async () => {
      const wrapper = shallowMountComponent()
      expect(wrapper.vm.pathHash('/data/docs')).toEqual(expect.any(String))
      expect(wrapper.vm.pathHash('/data/docs').length).toBeGreaterThan(0)
    })

    it('is stable — same path always produces the same hash', async () => {
      const wrapper = shallowMountComponent()
      expect(wrapper.vm.pathHash('/data/docs')).toBe(wrapper.vm.pathHash('/data/docs'))
    })

    it('produces different hashes for different paths', async () => {
      const wrapper = shallowMountComponent()
      expect(wrapper.vm.pathHash('/data/docs')).not.toBe(wrapper.vm.pathHash('/data/other'))
    })
  })
})
