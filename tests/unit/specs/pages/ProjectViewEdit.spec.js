import { createLocalVue, shallowMount, mount } from '@vue/test-utils'

import { Api } from '@/api'
import { Core } from '@/core'
import ProjectViewEdit from '@/pages/ProjectViewEdit'


describe('ProjectViewEdit.vue', () => {
  let config, i18n, localVue, store, wait, api

  beforeAll(() => {
    api = new Api(null, null)
    api.updateProject = jest.fn().mockResolvedValue({})
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

  it('call api.updateProject when the form is submitted', async () => {
    const propsData = { name: 'local-datashare' }
    const wrapper= mount(ProjectViewEdit, { localVue, store, wait, i18n, propsData })
    const projectForm = wrapper.findComponent({ name: 'ProjectForm' })
    await projectForm.trigger('submit')
    expect(api.updateProject).toBeCalled()
  })
})
