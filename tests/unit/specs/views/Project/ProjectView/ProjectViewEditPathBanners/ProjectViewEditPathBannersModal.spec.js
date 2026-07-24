import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEditPathBannersModal from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEditPathBanners/ProjectViewEditPathBannersModal.vue'
import { apiInstance as api } from '@/api/apiInstance.js'

vi.mock('@/api/apiInstance', () => ({
  apiInstance: {
    savePathBanner: vi.fn()
  }
}))

const mockToast = { success: vi.fn(), error: vi.fn() }
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}))

describe('ProjectViewEditPathBannersModal.vue', () => {
  let core
  const props = { name: 'local-datashare', banner: null }

  const existingBanner = Object.freeze({
    note: 'Existing banner',
    variant: 'info',
    blurSensitiveMedia: false,
    path: '/data/docs'
  })

  function shallowMountComponent(extraProps = {}) {
    return shallowMount(ProjectViewEditPathBannersModal, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { ...props, ...extraProps }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    api.savePathBanner.mockResolvedValue({})
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('modal is closed when route has no bannerId', () => {
    const wrapper = shallowMountComponent()
    expect(wrapper.vm.open).toBe(false)
  })

  it('modal is open when route has bannerId=new', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'new' } })
    await flushPromises()
    const wrapper = shallowMountComponent()
    expect(wrapper.vm.open).toBe(true)
  })

  it('modal is open when route has a bannerId', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
    await flushPromises()
    const wrapper = shallowMountComponent({ banner: existingBanner })
    expect(wrapper.vm.open).toBe(true)
  })

  it('uses a default empty banner for the new route', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'new' } })
    await flushPromises()
    const wrapper = shallowMountComponent()
    expect(wrapper.vm.activeBanner).toMatchObject({ path: null, note: '', variant: 'info', blurSensitiveMedia: false })
  })

  it('uses the banner prop for the edit route', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
    await flushPromises()
    const wrapper = shallowMountComponent({ banner: existingBanner })
    expect(wrapper.vm.activeBanner).toMatchObject(existingBanner)
  })

  it('title says "Add banner" for the new route', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'new' } })
    await flushPromises()
    const wrapper = shallowMountComponent()
    expect(wrapper.vm.modalTitle).toBe('Add banner')
  })

  it('title says "Edit banner" for the edit route', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
    await flushPromises()
    const wrapper = shallowMountComponent({ banner: existingBanner })
    expect(wrapper.vm.modalTitle).toBe('Edit banner')
  })

  describe('save', () => {
    it('calls savePathBanner API on save', async () => {
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(api.savePathBanner).toBeCalledWith('local-datashare', existingBanner.path, existingBanner)
    })

    it('emits banner:save after a successful save', async () => {
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(wrapper.emitted('banner:save')).toBeTruthy()
    })

    it('shows a "Banner created." toast when creating a new banner', async () => {
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'new' } })
      await flushPromises()
      const wrapper = shallowMountComponent()
      await wrapper.vm.onModalSave({ ...existingBanner })
      await flushPromises()
      expect(mockToast.success).toBeCalledWith('Banner created.')
    })

    it('shows a "Banner saved." toast when updating an existing banner', async () => {
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(mockToast.success).toBeCalledWith('Banner saved.')
    })

    it('navigates back after a successful save', async () => {
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      const push = vi.spyOn(core.router, 'push')
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(push).toBeCalledWith(expect.objectContaining({ params: expect.objectContaining({ bannerId: undefined }) }))
    })

    it('does not emit banner:save when API call fails', async () => {
      api.savePathBanner.mockRejectedValue(new Error('fail'))
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(wrapper.emitted('banner:save')).toBeFalsy()
    })

    it('shows an error toast on failed create', async () => {
      api.savePathBanner.mockRejectedValue(new Error('fail'))
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'new' } })
      await flushPromises()
      const wrapper = shallowMountComponent()
      await wrapper.vm.onModalSave({ ...existingBanner })
      await flushPromises()
      expect(mockToast.error).toBeCalledWith('Failed to create banner.')
    })

    it('shows an error toast on failed update', async () => {
      api.savePathBanner.mockRejectedValue(new Error('fail'))
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(mockToast.error).toBeCalledWith('Failed to save banner.')
    })

    it('does not navigate back when save fails', async () => {
      api.savePathBanner.mockRejectedValue(new Error('fail'))
      await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: '0' } })
      await flushPromises()
      const wrapper = shallowMountComponent({ banner: existingBanner })
      const push = vi.spyOn(core.router, 'push')
      await wrapper.vm.onModalSave(existingBanner)
      await flushPromises()
      expect(push).not.toHaveBeenCalled()
    })
  })

  it('navigates back when cancel is called', async () => {
    await core.router.push({ name: 'project.view.edit.banners', params: { name: 'local-datashare', bannerId: 'new' } })
    await flushPromises()
    const wrapper = shallowMountComponent()
    const push = vi.spyOn(core.router, 'push')
    wrapper.vm.closeModal()
    expect(push).toBeCalledWith(expect.objectContaining({ params: expect.objectContaining({ bannerId: undefined }) }))
  })
})
