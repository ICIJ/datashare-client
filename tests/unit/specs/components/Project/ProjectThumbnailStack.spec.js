import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectThumbnailStack from '@/components/Project/ProjectThumbnailStack'

describe('ProjectThumbnailStack.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll()

  beforeAll(() => {
    config.set('projects', [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' },
      { name: 'citrus-confidential', label: 'Citrus Confidential' },
      { name: 'green-files', label: 'Green Files' }
    ])
  })

  const mountStack = (props) => {
    return mount(ProjectThumbnailStack, { global: { plugins }, props })
  }

  const findThumbnails = (wrapper) => {
    return wrapper.findAllComponents({ name: 'ProjectThumbnail' })
  }

  it('should render nothing without projects', () => {
    const wrapper = mountStack({ projects: [] })
    expect(findThumbnails(wrapper)).toHaveLength(0)
  })

  it('should render one thumbnail per project below the maximum', () => {
    const wrapper = mountStack({ projects: ['banana-papers'] })
    expect(findThumbnails(wrapper)).toHaveLength(1)
  })

  it('should render at most two thumbnails by default', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential']
    const wrapper = mountStack({ projects })
    expect(findThumbnails(wrapper)).toHaveLength(2)
  })

  it('should accept a bare string as a single project', () => {
    const wrapper = mountStack({ projects: 'banana-papers' })
    expect(findThumbnails(wrapper)).toHaveLength(1)
  })

  it('should resolve a project name into its configured project', () => {
    const wrapper = mountStack({ projects: ['banana-papers'] })
    const [thumbnail] = findThumbnails(wrapper)
    expect(thumbnail.props('project')).toMatchObject({ label: 'Banana Papers' })
  })

  it('should fall back to a bare name for an unknown project', () => {
    const wrapper = mountStack({ projects: ['unknown-project'] })
    const [thumbnail] = findThumbnails(wrapper)
    expect(thumbnail.props('project')).toMatchObject({ name: 'unknown-project' })
  })

  it('should honour a custom maximum', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential', 'green-files']
    const wrapper = mountStack({ projects, max: 3 })
    expect(findThumbnails(wrapper)).toHaveLength(3)
  })

  it('should not render an overflow badge unless asked', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential']
    const wrapper = mountStack({ projects })
    expect(wrapper.find('.project-thumbnail-stack__overflow').exists()).toBe(false)
  })

  it('should render an overflow badge beyond the maximum', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential', 'green-files']
    const wrapper = mountStack({ projects, max: 3, overflow: true })
    expect(wrapper.find('.project-thumbnail-stack__overflow').exists()).toBe(true)
    expect(findThumbnails(wrapper)).toHaveLength(3)
  })

  // The dropdown selector renders three real thumbnails plus a badge once a fourth
  // project is selected. A "max counts every slot" reading would silently drop the
  // badge at exactly this length, so it is pinned here.
  it('should render the overflow badge as an extra slot, not in place of a thumbnail', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential', 'green-files']
    const wrapper = mountStack({ projects, max: 3, overflow: true })
    const slots = wrapper.findAll('.project-thumbnail-stack__item')
    expect(slots).toHaveLength(4)
  })

  it('should not render an overflow badge when the list fits the maximum', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential']
    const wrapper = mountStack({ projects, max: 3, overflow: true })
    expect(wrapper.find('.project-thumbnail-stack__overflow').exists()).toBe(false)
  })
})
