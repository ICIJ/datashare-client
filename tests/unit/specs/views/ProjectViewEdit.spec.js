import { shallowMount, mount } from '@vue/test-utils'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import ProjectViewEdit from '@/views/Project/ProjectView/ProjectViewEdit'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      updateProject: vi.fn(),
      deleteProject: vi.fn()
    }
  }
})

describe('ProjectViewEdit.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    // Ensure the local-datashare project can be found
    core.config.set('projects', [{ name: 'local-datashare', label: 'Default', sourcePath: '/' }])
  })

  it('contains a ProjectForm', () => {
    const props = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    expect(wrapper.findComponent({ name: 'ProjectForm' }).exists()).toBeTruthy()
  })

  it('contains a ProjectForm in `edit` mode', async () => {
    const props = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props
    })
    const projectForm = wrapper.findComponent({ name: 'ProjectForm' })
    expect(projectForm.vm.edit).toBeTruthy()
  })

  it('updates values of a project when the form is submitted', async () => {
    // Given
    const props = { name: 'local-datashare' }
    const wrapper = mount(ProjectViewEdit, { global: { plugins: core.plugins }, props })
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
