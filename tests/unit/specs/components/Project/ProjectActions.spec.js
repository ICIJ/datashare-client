import { shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur-next'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectActions from '@/components/Project/ProjectActions'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'

describe('ProjectActions.vue', () => {
  let core, plugins
  const project = { name: 'test-project' }

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  beforeEach(() => {
    core.createPinia()
    plugins = core.plugins
  })

  afterEach(() => {
    Murmur.config.set('mode', null)
    Murmur.config.set('policies', [])
  })

  describe('in local mode', () => {
    beforeEach(() => {
      Murmur.config.set('mode', 'LOCAL')
    })

    it('shows the edit button', () => {
      const wrapper = shallowMount(ProjectActions, {
        global: {
          plugins,
          stubs: {
            ModeLocalOnly: { template: '<slot />' },
            PolicyOnly: { template: '<slot />' }
          }
        },
        props: { project }
      })
      expect(wrapper.findComponent(ButtonRowActionEdit).exists()).toBe(true)
    })

    it('shows the delete button', () => {
      const wrapper = shallowMount(ProjectActions, {
        global: {
          plugins,
          stubs: {
            ModeLocalOnly: { template: '<slot />' },
            PolicyOnly: { template: '<slot />' }
          }
        },
        props: { project }
      })
      expect(wrapper.findComponent(ButtonRowActionDelete).exists()).toBe(true)
    })
  })

  describe('in server mode as a non-admin', () => {
    beforeEach(() => {
      Murmur.config.set('mode', 'SERVER')
      Murmur.config.set('policies', [{ projectId: 'test-project', role: 'PROJECT_MEMBER' }])
    })

    it('hides the edit button', () => {
      const wrapper = shallowMount(ProjectActions, {
        global: { plugins },
        props: { project }
      })
      expect(wrapper.findComponent(ButtonRowActionEdit).exists()).toBe(false)
    })

    it('hides the delete button', () => {
      const wrapper = shallowMount(ProjectActions, {
        global: { plugins },
        props: { project }
      })
      expect(wrapper.findComponent(ButtonRowActionDelete).exists()).toBe(false)
    })
  })

  describe('in server mode as a project admin', () => {
    beforeEach(() => {
      Murmur.config.set('mode', 'SERVER')
      Murmur.config.set('policies', [{ projectId: 'test-project', role: 'PROJECT_ADMIN' }])
    })

    it('shows the edit button', () => {
      const wrapper = shallowMount(ProjectActions, {
        global: {
          plugins,
          stubs: {
            PolicyOnly: { template: '<slot />' }
          }
        },
        props: { project }
      })
      expect(wrapper.findComponent(ButtonRowActionEdit).exists()).toBe(true)
    })

    it('hides the delete button', () => {
      const wrapper = shallowMount(ProjectActions, {
        global: {
          plugins,
          stubs: {
            PolicyOnly: { template: '<slot />' }
          }
        },
        props: { project }
      })
      expect(wrapper.findComponent(ButtonRowActionDelete).exists()).toBe(false)
    })
  })
})
