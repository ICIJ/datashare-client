import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectViewEdit from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEdit.vue'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      updateProject: vi.fn(),
      removeProject: vi.fn(),
      getPathBanners: vi.fn().mockResolvedValue([]),
      getVersion: vi.fn().mockResolvedValue({})
    }
  }
})

describe('ProjectViewEditDetails.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    core.config.set('projects', [{ name: 'local-datashare', label: 'Default', sourcePath: '/' }])
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('updates values of a project when the form is submitted', async () => {
    await core.router.push({ name: 'project.view.edit.details', params: { name: 'local-datashare' } })
    const props = { name: 'local-datashare' }
    const wrapper = mount(ProjectViewEdit, { global: { plugins: core.plugins }, props })
    await flushPromises()
    expect(wrapper.vm.$core.projects[0].label).toBe('Default')
    const projectFormValues = {
      allowFromMask: '*.*.*.*',
      description: null,
      label: 'Default',
      logoUrl: null,
      maintainerName: null,
      name: 'local-datashare',
      publisherName: null,
      sourcePath: '/',
      sourceUrl: null
    }
    // when
    const projectForm = wrapper.findComponent({ name: 'ProjectForm' })
    await projectForm.vm.$emit('submit', { ...projectFormValues, label: 'NEWLABEL' })
    await flushPromises()

    // then
    expect(api.updateProject).toBeCalledWith({ ...projectFormValues, label: 'NEWLABEL' })
    expect(wrapper.vm.$core.projects[0].label).toBe('NEWLABEL')
  })
})
