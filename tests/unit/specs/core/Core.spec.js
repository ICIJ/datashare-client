import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import Vuex from 'vuex'
import Vue from 'vue'
import Murmur from '@icij/murmur'
import { createLocalVue } from '@vue/test-utils'

import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    get: jest.fn().mockResolvedValue({ data: {} }),
    request: jest.fn().mockResolvedValue({ data: { userProjects: ['first-index'] } })
  }
})

describe('Core', () => {
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
  })

  beforeEach(() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'core')
    document.body.appendChild(app)
  })

  it('should instantiate the Core class', async () => {
    const core = new Core(localVue)
    expect(core).toBeInstanceOf(Core)
  })

  it('should instantiate the Core class using a static method', async () => {
    const core = Core.init(localVue)
    expect(core).toBeInstanceOf(Core)
  })

  it('should expose the router', async () => {
    const { router } = Core.init(localVue).useAll()
    expect(router).toBeInstanceOf(VueRouter)
  })

  it('should expose the VueI18n', async () => {
    const { i18n } = Core.init(localVue).useAll()
    expect(i18n).toBeInstanceOf(VueI18n)
  })

  it('should expose the store', async () => {
    const { store } = Core.init(localVue).useAll()
    expect(store).toBeInstanceOf(Vuex.Store)
  })

  it('should not expose the router if it is not installed', async () => {
    const { router } = Core.init(localVue)
    expect(router).not.toBeInstanceOf(VueRouter)
  })

  it('should not expose the VueI18n if it is not installed', async () => {
    const { i18n } = Core.init(localVue)
    expect(i18n).not.toBeInstanceOf(VueI18n)
  })

  it('should expose the config from Murmur', async () => {
    const { config } = Core.init(localVue).useAll()
    expect(config).toBe(Murmur.config)
  })

  it('should mount the app on a specific element', () => {
    const core = Core.init(localVue).useAll()
    const vm = core.mount('#core')
    expect(vm).toBeInstanceOf(Vue)
  })

  it('should call a global event "datashare:ready" after the core is configured', (done) => {
    document.addEventListener('datashare:ready', ({ detail }) => {
      expect(detail.core).toBeInstanceOf(Core)
      done()
    }, { once: true })
    // Create and configure the core
    Core.init(localVue).useAll().configure()
  })

  it('should resolve the `ready` promise after the core was configured', async () => {
    // Create and configure the core
    const core = Core.init(localVue).useAll()
    // For `ready` to be resolved, the core must configure
    core.configure()
    await expect(core.ready).resolves.toBe(core)
  })

  it('should install the internal `VueCore` plugin', async () => {
    // Create and configure the core
    const core = Core.init(localVue).useAll()
    const vm = core.mount('#core')
    expect(vm.$core).toBeInstanceOf(Core)
  })
})
