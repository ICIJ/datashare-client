import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectRoleThumbnail from '@/components/Project/ProjectRoleThumbnail.vue'
import ProjectThumbnail from '@/components/Project/ProjectThumbnail.vue'

describe('ProjectRoleThumbnail.vue', () => {
  let core, global

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    global = { plugins: core.plugins }
  })

  function mountComponent(props = {}) {
    return shallowMount(ProjectRoleThumbnail, {
      global,
      props: { project: 'my-project', role: 'PROJECT_ADMIN', ...props }
    })
  }

  it('renders the project thumbnail for the given project', () => {
    const wrapper = mountComponent()
    expect(wrapper.findComponent(ProjectThumbnail).props('project')).toMatchObject({ name: 'my-project' })
  })

  it('carries a title tooltip with the project and role name, since neither is shown as text', () => {
    const wrapper = mountComponent({ project: 'my-project', role: 'PROJECT_ADMIN' })
    expect(wrapper.attributes('title')).toContain('my-project')
    expect(wrapper.attributes('title')).toContain('Admin')
  })

  it('picks the role icon/color for the given role', () => {
    const wrapper = mountComponent({ role: 'INSTANCE_ADMIN' })
    expect(wrapper.vm.iconStyle).toEqual({ color: 'var(--bs-danger)' })
  })
})
