import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import ProjectView from '@/pages/ProjectView'

describe('ProjectView.vue', () => {
  let config, i18n, localVue, router, store, wait

  beforeAll(() => {
    const core = Core.init(createLocalVue()).useAll()
    config = core.config
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    router = core.router
    const routes = [
      {
        name: 'project.view.insights',
        path: 'insights'
      },
      {
        name: 'project.view.edit',
        path: 'edit'
      }
    ]
    router = new VueRouter({ routes })
    wait = core.wait
    // Ensure the local-datashare project can be found
    config.set('projects', [{ name: 'local-datashare', label: 'Default', sourcePath: '/' }])
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('contains an edit link in LOCAL mode', async () => {
    config.set('mode', 'LOCAL')
    const stubs = { RouterView: true }
    const propsData = { name: 'local-datashare' }
    const wrapper = mount(ProjectView, { localVue, store, router, wait, i18n, stubs, propsData })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-view__tab--edit').exists()).toBe(true)
  })

  it('contains an edit link in EMBEDDED mode', async () => {
    config.set('mode', 'EMBEDDED')
    const stubs = { RouterView: true }
    const propsData = { name: 'local-datashare' }
    const wrapper = mount(ProjectView, { localVue, store, router, wait, i18n, stubs, propsData })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-view__tab--edit').exists()).toBe(true)
  })

  it('not contains an edit link in SERVER mode', async () => {
    config.set('mode', 'SERVER')
    const stubs = { RouterView: true }
    const propsData = { name: 'local-datashare' }
    const wrapper = mount(ProjectView, { localVue, store, router, wait, i18n, stubs, propsData })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.project-view__tab--edit').exists()).toBe(false)
  })
})
