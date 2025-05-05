import { shallowMount, mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskActions from '@/components/Task/TaskActions'
import TaskPage from '@/views/Task/TaskPage'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      index: vi.fn(),
      indexPath: vi.fn(),
      findNames: vi.fn(),
      stopPendingTasks: vi.fn(),
      stopTask: vi.fn(),
      getTasks: vi.fn().mockResolvedValue({ items: [] }),
      removeDoneTasks: vi.fn(),
      getNerPipelines: vi.fn()
    }
  }
})

describe('Task.vue', () => {
  const props = { pageName: 'task' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('renders correctly', () => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

    const wrapper = shallowMount(TaskPage, { global: { plugins } })
    expect(wrapper.exists()).toBe(true)
  })

  it('show a page header with task actions', () => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

    const wrapper = mount(TaskPage, { global: { plugins, renderStubDefaultSlot: true }, props })
    const actions = wrapper.findComponent(TaskActions)
    expect(actions.exists()).toBe(true)
  })

  it('should fetch tasks on mount', async () => {
    api.getTasks.mockResolvedValue({ items: [{ state: 'DONE' }] })
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
    shallowMount(TaskPage, { global: { plugins }, props })
    await flushPromises()
    expect(api.getTasks).toHaveBeenCalledTimes(1)
  })

  it('should call delete done tasks when the delete action is triggered', async () => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const wrapper = mount(TaskPage, { global: { plugins, renderStubDefaultSlot: true }, props })
    const actions = wrapper.findComponent(TaskActions)
    const spy = vi.spyOn(wrapper.vm, 'removeDoneTasks')

    await actions.vm.$emit('delete-done')

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should stop pending tasks when the stop pending action is triggered', async () => {
    const { plugins } = CoreSetup.init().useAll().useRouterWithoutGuards()

    const wrapper = mount(TaskPage, { global: { plugins, renderStubDefaultSlot: true }, props })
    const actions = wrapper.findComponent(TaskActions)
    const spy = vi.spyOn(wrapper.vm, 'stopPendingTasks')

    await actions.vm.$emit('stop-pending')

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
