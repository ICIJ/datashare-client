import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import { flushPromises } from 'tests/unit/tests_utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ProjectViewEdit from '@/pages/ProjectViewEdit'

describe('ProjectViewEdit.vue', () => {
  let config, i18n, localVue, store, wait, api

  beforeAll(() => {
    api = new Api(null, null)
    api.updateProject = jest.fn().mockResolvedValue({})
    api.deleteProject = jest.fn().mockResolvedValue({})
    const core = Core.init(createLocalVue(), api).useAll()
    config = core.config
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    // Ensure the local-datashare project can be found
    config.set('projects', [{ name: 'local-datashare', label: 'Default', sourcePath: '/' }])
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('contains a ProjectForm', () => {
    const propsData = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, { localVue, store, wait, i18n, propsData })
    expect(wrapper.findComponent({ name: 'ProjectForm' }).exists()).toBeTruthy()
  })

  it('contains a ProjectForm in `edit` mode', async () => {
    const propsData = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, { localVue, store, wait, i18n, propsData })
    const projectForm = wrapper.findComponent({ name: 'ProjectForm' })
    expect(projectForm.vm.edit).toBeTruthy()
  })

  it('updates values of a project when the form is submitted', async () => {
    // Given
    const propsData = { name: 'local-datashare' }
    const wrapper = mount(ProjectViewEdit, { localVue, store, wait, i18n, propsData })
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

  it('deletes the project when the form emits a deleted event', async () => {
    const propsData = { name: 'local-datashare' }

    const wrapper = mount(ProjectViewEdit, { localVue, store, wait, i18n, propsData, config })
    expect(wrapper.vm.$core.projects).toHaveLength(1)

    const projectForm = wrapper.findComponent({ name: 'ProjectForm' })
    projectForm.vm.$emit('delete', { name: 'local-datashare' })
    await flushPromises()

    expect(wrapper.vm.$core.projects).toHaveLength(0)
    expect(api.deleteProject).toBeCalledWith('local-datashare')
  })
})
