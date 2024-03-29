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
          { name: 'task.analysis.list', path: 'analysis' },
          { name: 'task.batch-download.list', path: 'batch-download' },
          { name: 'task.batch-search.list', path: 'batch-search' }
        ]
      }
    ]
  })

  const replaceRouteby = ({ name }) => {
    if (router?.history?.current?.name !== name) {
      router.replace({ name })
    }
  }

  it('should select the "batch-search" tab by default', () => {
    replaceRouteby({ name: 'tasks' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    expect(wrapper.vm.tab).toBe(null)
  })

  it('should select the "batch-download" tab when the route is active', () => {
    replaceRouteby({ name: 'task.batch-download.list' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    expect(wrapper.vm.tab).toBe(1)
  })

  it('should not add the new "batch-search" form in a modal', async () => {
    replaceRouteby({ name: 'task.batch-download.list' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$refs['batch-search-form']).toBeUndefined()
  })

  it('should select the "indexing" tab when the route is active', () => {
    replaceRouteby({ name: 'task.analysis.list' })
    wrapper = shallowMount(Tasks, { i18n, localVue, store, router })
    expect(wrapper.vm.tab).toBe(2)
  })
})
