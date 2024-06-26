import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import Tasks from '@/pages/Tasks'

describe('Tasks.vue', () => {
  const routes = [
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

  let core

  const replaceRouteby = ({ name }) => {
    if (core?.router?.currentRoute?.name !== name) {
      return core.router.replace({ name })
    }
  }

  beforeEach(() => {
    core = CoreSetup.init().useRouter(routes)
  })

  it('should select the no tab by default', async () => {
    await replaceRouteby({ name: 'tasks' })
    const wrapper = shallowMount(Tasks, { global: { plugins: core.plugins } })
    expect(wrapper.vm.tab).toBe(-1)
  })

  it('should select the "batch-download" tab when the route is active', async () => {
    await replaceRouteby({ name: 'task.batch-download.list' })
    const wrapper = shallowMount(Tasks, { global: { plugins: core.plugins } })
    expect(wrapper.vm.tab).toBe(1)
  })

  it('should not add the new "batch-search" form in a modal', async () => {
    await replaceRouteby({ name: 'task.batch-download.list' })
    const wrapper = shallowMount(Tasks, { global: { plugins: core.plugins } })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$refs['batch-search-form']).toBeUndefined()
  })

  it('should select the "indexing" tab when the route is active', async () => {
    await replaceRouteby({ name: 'task.analysis.list' })
    const wrapper = shallowMount(Tasks, { global: { plugins: core.plugins } })
    expect(wrapper.vm.tab).toBe(2)
  })
})
