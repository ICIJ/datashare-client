import { mount, shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'

import ProjectDeletionModal from '@/components/Project/ProjectDeletionModal'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'

describe('ProjectDeletionModal.vue', () => {
  let api, plugins
  let project
  beforeEach(() => {
    const { index: name, es } = esConnectionHelper.build()
    project = { name }
    api = { updateProject: vi.fn(), deleteProject: vi.fn() ,elasticsearch: es }
    const core = CoreSetup.init(api)
      .useAll()
      .useRouter([
        {
          name: 'project.list',
          path: '/project'
        }
      ])
    // Ensure the local-datashare project can be found
    core.config.set('projects', [{ name, label: 'Default', sourcePath: '/' }])
    plugins = core.plugins
  })

  it('deletes the project when the model emits a ok event', async () => {
    const props = { project }
    const wrapper = shallowMount(ProjectDeletionModal, { global: { plugins }, props })

    expect(wrapper.vm.$core.projects).toHaveLength(1)

    await wrapper.trigger('ok')
    expect(api.deleteProject).toBeCalledWith(project.name)
    expect(wrapper.vm.$core.projects).toHaveLength(0)
  })
})
