import Murmur from '@icij/murmur-next'
import { createLocalVue } from '@vue/test-utils'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import { Core } from '@/core'

describe('Core', () => {
  let api, core

  beforeAll(() => {
    api = {
      createProject: vi.fn(),
      isDownloadAllowed: vi.fn(),
      getUser: vi.fn(),
      getSettings: vi.fn(),
      getProject: vi.fn()
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    const localVue = createLocalVue()
    core = Core.init(localVue, api)

    const app = document.createElement('div')
    app.setAttribute('id', 'core')
    document.body.appendChild(app)
  })

  it('should instantiate the Core class using a static method', () => {
    expect(Core.isInstanceOfCore(core)).toBe(true)
  })
  it('should not expose the router if it is not installed', () => {
    expect(core.router).not.toBeInstanceOf(VueRouter)
  })

  it('should not expose the VueI18n if it is not installed', () => {
    expect(core.i18n).not.toBeInstanceOf(VueI18n)
  })

  describe('Call useAll on Core', () => {
    beforeEach(() => {
      core.useAll()
      // empty config for projects to avoid side effects
      core.config.set('projects', undefined)
      core.config.set('defaultProject', undefined)
    })

    it('should expose the router', () => {
      expect(core.router).toBeInstanceOf(VueRouter)
    })

    it('should expose the VueI18n', () => {
      expect(core.i18n).toBeInstanceOf(VueI18n)
    })

    it('should expose the store', () => {
      expect(core.store).toBeInstanceOf(Vuex.Store)
    })

    it('should expose the config from Murmur', () => {
      expect(core.config).toBe(Murmur.config)
    })

    it('should mount the app on a specific element', () => {
      const vm = core.mount('#core')
      expect(vm).toBeInstanceOf(Vue)
    })

    it('should call a global event "datashare:ready" after the core is configured', () => {
      return new Promise((resolve) => {
        api.getSettings.mockResolvedValueOnce({})
        api.getProject.mockResolvedValueOnce({})

        document.addEventListener(
          'datashare:ready',
          ({ detail }) => {
            expect(Core.isInstanceOfCore(detail.core)).toBe(true)
            resolve()
          },
          { once: true }
        )
        // Create and configure the core
        return core.configure()
      })
    })

    it('should resolve the `ready` promise after the core was configured', async () => {
      api.getSettings.mockResolvedValueOnce({})
      api.getProject.mockResolvedValueOnce({ userProjects: ['first-index'] })
      // For `ready` to be resolved, the core must configure
      await core.configure()
      await expect(core.ready).resolves.toBe(core)
    })

    it('should call isDownloadAllowed API endpoint', async () => {
      const project = 'my-project'
      api.getSettings.mockResolvedValueOnce({})
      api.createProject.mockResolvedValueOnce({ name: project, label: 'MyProject' })
      core.store.commit('search/index', project)
      await core.configure()

      expect(api.isDownloadAllowed).toBeCalledTimes(1)
      expect(api.isDownloadAllowed).toBeCalledWith(project)
    })

    it('should return empty string if user has no projects', () => {
      core.config.set('defaultProject', 'my_project')
      expect(core.getDefaultProject()).toEqual('')
    })
    it('should install the internal `VueCore` plugin', () => {
      // Create and configure the core
      const vm = core.mount('#core')
      expect(Core.isInstanceOfCore(vm.$core)).toBe(true)
    })

    it('should getDefaultProject when user has it', () => {
      core.config.set('projects', [{ name: 'my_project' }])
      core.config.set('defaultProject', 'my_project')
      expect(core.getDefaultProject()).toEqual('my_project')
    })

    it("should return first user project when user doesn't have the default project", () => {
      core.config.set('projects', [{ name: 'user_project' }])
      core.config.set('defaultProject', 'default_project')
      expect(core.getDefaultProject()).toEqual('user_project')
    })
  })
})
