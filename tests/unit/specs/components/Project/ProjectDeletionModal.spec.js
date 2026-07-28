import { shallowMount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectDeletionModal from '@/components/Project/ProjectDeletionModal'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { apiInstance as api } from '@/api/apiInstance'
import { MODE_NAME } from '@/mode'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      removeProject: vi.fn(),
      getRecommendationsByProject: vi.fn(),
      elasticsearch: {
        countDocuments: vi.fn().mockResolvedValue(50),
        countTags: vi.fn().mockResolvedValue(2)
      }
    }
  }
})

describe('ProjectDeletionModal.vue', () => {
  let plugins, project, core

  beforeEach(() => {
    const { index: name } = esConnectionHelper.build()
    // The modal uses the router to redirect to the project list so the route must exist
    const routes = [{ name: 'project.list', path: '/project' }]
    core = CoreSetup.init().useAll().useRouter(routes)
    // Ensure the local-datashare project can be found
    core.config.set('projects', [{ name, label: 'Default', sourcePath: '/' }])
    plugins = core.plugins
    project = { name }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('deletes the project when the model emits a ok event', async () => {
    const props = { project }
    const wrapper = shallowMount(ProjectDeletionModal, { global: { plugins }, props })
    expect(wrapper.vm.$core.projects).toHaveLength(1)
    await wrapper.trigger('ok')
    expect(api.removeProject).toBeCalledWith(project.name)
    expect(wrapper.vm.$core.projects).toHaveLength(0)
  })

  it('should call the API to retrieve project recommendations count in server mode', async () => {
    core.config.set('mode', MODE_NAME.SERVER)
    api.getRecommendationsByProject.mockResolvedValue({ totalCount: 3 })

    shallowMount(ProjectDeletionModal, { global: { plugins }, props: { project } })
    await flushPromises()

    expect(api.getRecommendationsByProject).toBeCalledWith(project.name)
  })

  it('should not call the API to retrieve project recommendations count in local mode', async () => {
    core.config.set('mode', MODE_NAME.LOCAL)

    shallowMount(ProjectDeletionModal, { global: { plugins }, props: { project } })
    await flushPromises()

    expect(api.getRecommendationsByProject).not.toHaveBeenCalled()
  })
})
