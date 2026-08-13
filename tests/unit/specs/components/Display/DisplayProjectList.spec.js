import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DisplayProjectList from '@/components/Display/DisplayProjectList'

describe('DisplayProjectList.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  beforeAll(() => {
    config.set('projects', [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' }
    ])
  })

  const mountList = (values) => {
    return mount(DisplayProjectList, { global: { plugins }, props: { values } })
  }

  it('should delegate its values to a projects button', () => {
    const values = ['banana-papers', 'lux-leaks']
    const wrapper = mountList(values)
    const button = wrapper.findComponent({ name: 'ProjectsButton' })
    expect(button.exists()).toBe(true)
    expect(button.props('projects')).toEqual(values)
  })

  it('should pass a bare string through unchanged', () => {
    const wrapper = mountList('banana-papers')
    expect(wrapper.findComponent({ name: 'ProjectsButton' }).props('projects')).toBe('banana-papers')
  })
})
