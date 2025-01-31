import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectDeletionModal from '@/components/Project/ProjectDeletionModal'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'

describe('ProjectDeletionModal.vue', () => {
  let api, plugins, project

  beforeEach(() => {
    const { index: name, es: elasticsearch } = esConnectionHelper.build()
    api = { elasticsearch, deleteProject: vi.fn(), getRecommendationsByProject: vi.fn() }
    api.elasticsearch.deleteProject = vi.fn()
    api.elasticsearch.countDocuments = vi.fn().mockResolvedValue(50)
    api.elasticsearch.countTags = vi.fn().mockResolvedValue(2)
    // The modal uses the router to redirect to the project list so the route must exist
    const routes = [{ name: 'project.list', path: '/project' }]
    const core = CoreSetup.init(api).useAll().useRouter(routes)
    // Ensure the local-datashare project can be found
    core.config.set('projects', [{ name, label: 'Default', sourcePath: '/' }])
    plugins = core.plugins
    project = { name }
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
