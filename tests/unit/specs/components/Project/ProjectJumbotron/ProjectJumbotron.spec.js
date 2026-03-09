import { shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectJumbotron from '@/components/Project/ProjectJumbotron/ProjectJumbotron'
import DisplayRole from '@/components/Display/DisplayRole'

describe('ProjectJumbotron.vue', () => {
  let plugins

  beforeEach(() => {
    plugins = CoreSetup.init().useAll().plugins
  })

  afterEach(() => {
    Murmur.config.set('mode', null)
    Murmur.config.set('policies', [])
  })

  it('should render without errors', () => {
    const project = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectJumbotron, { global: { plugins }, props: { project } })
    expect(wrapper.exists()).toBe(true)
  })

  describe('DisplayRole in server mode', () => {
    const project = { name: 'citrus-confidential' }

    beforeEach(() => {
      Murmur.config.set('mode', 'SERVER')
    })

    it('shows the role from policies for the current project', () => {
      Murmur.config.set('policies', [{ projectId: 'citrus-confidential', role: 'PROJECT_ADMIN' }])
      const wrapper = shallowMount(ProjectJumbotron, {
        global: {
          plugins,
          stubs: { ModeServerOnly: { template: '<slot />' } }
        },
        props: { project }
      })
      expect(wrapper.findComponent(DisplayRole).props('value')).toBe('PROJECT_ADMIN')
    })

    it('shows default role when no policy exists for the project', () => {
      Murmur.config.set('policies', [{ projectId: 'other-project', role: 'PROJECT_ADMIN' }])
      const wrapper = shallowMount(ProjectJumbotron, {
        global: {
          plugins,
          stubs: { ModeServerOnly: { template: '<slot />' } }
        },
        props: { project }
      })
      expect(wrapper.findComponent(DisplayRole).props('value')).toBe('PROJECT_MEMBER')
    })

    it('shows PROJECT_EDITOR role when policy has PROJECT_EDITOR', () => {
      Murmur.config.set('policies', [{ projectId: 'citrus-confidential', role: 'PROJECT_EDITOR' }])
      const wrapper = shallowMount(ProjectJumbotron, {
        global: {
          plugins,
          stubs: { ModeServerOnly: { template: '<slot />' } }
        },
        props: { project }
      })
      expect(wrapper.findComponent(DisplayRole).props('value')).toBe('PROJECT_EDITOR')
    })
  })
})
