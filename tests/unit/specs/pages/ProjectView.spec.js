import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectView from '@/pages/ProjectView'

describe('ProjectView.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init()
      .useAll()
      .useRouter([
        {
          name: 'project.view.insights',
          path: '/insights'
        },
        {
          name: 'project.view.edit',
          path: '/edit'
        }
      ])
    // Ensure the local-datashare project can be found
    core.config.set('projects', [{ name: 'local-datashare', label: 'Default', sourcePath: '/' }])
  })

  afterAll(() => {
    vi.clearAllMocks()
  })

  it('contains an edit link in LOCAL mode', async () => {
    core.config.set('mode', 'LOCAL')
    const props = { name: 'local-datashare' }
    const wrapper = mount(ProjectView, { global: { plugins: core.plugins }, props })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-view__tab--edit').exists()).toBe(true)
  })

  it('contains an edit link in EMBEDDED mode', async () => {
    core.config.set('mode', 'EMBEDDED')
    const props = { name: 'local-datashare' }
    const wrapper = mount(ProjectView, { global: { plugins: core.plugins }, props })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-view__tab--edit').exists()).toBe(true)
  })

  it('not contains an edit link in SERVER mode', async () => {
    core.config.set('mode', 'SERVER')
    const props = { name: 'local-datashare' }
    const wrapper = mount(ProjectView, { global: { plugins: core.plugins }, props })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-view__tab--edit').exists()).toBe(false)
  })
})
