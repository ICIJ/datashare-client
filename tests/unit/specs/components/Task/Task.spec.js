import { shallowMount, mount, flushPromises } from '@vue/test-utils'

import Task from '@/views/Task/Task'
import CoreSetup from '~tests/unit/CoreSetup'
import TaskActions from '@/components/Task/TaskActions'

describe('Task.vue', () => {
  it('renders correctly', () => {
    const { plugins } = CoreSetup.init().useAll().useRouter()

    const wrapper = shallowMount(Task, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
  })
  it('show a page header with task actions', () => {
    const { plugins } = CoreSetup.init().useAll().useRouter()

    const wrapper = mount(Task, { global: { plugins, renderStubDefaultSlot: true } })
    const actions = wrapper.findComponent(TaskActions)
    expect(actions.exists()).toBe(true)
  })

  it('should fetch tasks on mount', async () => {
    const api = { getTasks: vi.fn().mockResolvedValue([{ state: 'DONE' }]) }
    const { plugins } = CoreSetup.init(api).useAll().useRouter()
    mount(Task, { global: { plugins } })
    await flushPromises()
    expect(api.getTasks).toHaveBeenCalledTimes(1)
  })
})
