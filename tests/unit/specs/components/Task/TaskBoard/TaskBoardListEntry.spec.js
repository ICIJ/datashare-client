import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBoardListEntry from '@/components/Task/TaskBoard/TaskBoardListEntry'
import IPhListMagnifyingGlass from '~icons/ph/list-magnifying-glass'

describe('TaskBoardListEntry.vue', () => {
  let core, warnSpy

  beforeEach(() => {
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('accepts an icon component (as produced by unplugin-icons) without a prop-type warning', () => {
    const props = {
      icon: IPhListMagnifyingGlass,
      title: 'Batch search',
      listLink: { name: 'task.batch-search.list' }
    }
    mount(TaskBoardListEntry, { props, global: { plugins: core.plugins } })

    const invalidPropWarning = warnSpy.mock.calls.find(([message]) => {
      return typeof message === 'string' && message.includes('Invalid prop') && message.includes('icon')
    })
    expect(invalidPropWarning).toBeUndefined()
  })

  it('still accepts a string icon name without a prop-type warning', () => {
    const props = {
      icon: 'list-magnifying-glass',
      title: 'Batch search',
      listLink: { name: 'task.batch-search.list' }
    }
    mount(TaskBoardListEntry, { props, global: { plugins: core.plugins } })

    const invalidPropWarning = warnSpy.mock.calls.find(([message]) => {
      return typeof message === 'string' && message.includes('Invalid prop') && message.includes('icon')
    })
    expect(invalidPropWarning).toBeUndefined()
  })
})
