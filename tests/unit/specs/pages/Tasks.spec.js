import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import Tasks from '@/pages/Tasks'

const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()

describe('Tasks.vue', () => {
  let wrapper
  const router = new VueRouter({
    routes: [
      {
        name: 'tasks',
        path: '/tasks',
        children: [
          { name: 'indexing', path: 'indexing' },
          { name: 'batch-download', path: 'batch-download' },
          { name: 'batch-search', path: 'batch-search' }
        ]
      }
    ]
  })

  it('should select the "batch-search" tab by default', () => {
    router.replace({ name: 'tasks' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    expect(wrapper.vm.tab).toBe(null)
  })

  it('should select the "batch-download" tab when the route is active', () => {
    router.replace({ name: 'batch-download' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    expect(wrapper.vm.tab).toBe(1)
  })

  it('should select the "indexing" tab when the route is active', () => {
    router.replace({ name: 'indexing' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    expect(wrapper.vm.tab).toBe(2)
  })
})
