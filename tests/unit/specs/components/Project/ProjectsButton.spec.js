import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectsButton from '@/components/Project/ProjectsButton'

describe('ProjectsButton.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll().useRouterWithoutGuards()

  beforeAll(() => {
    config.set('projects', [
      { name: 'banana-papers', label: 'Banana Papers' },
      { name: 'lux-leaks', label: 'LuxLeaks' },
      { name: 'citrus-confidential', label: 'Citrus Confidential' }
    ])
  })

  // The real popover never toggles under jsdom, so it is stubbed the same way
  // DocumentDownloadPopover.spec.js does. Open and close behavior is verified manually.
  const AppPopoverStub = {
    name: 'AppPopover',
    props: ['title'],
    template: '<div class="app-popover-stub"><slot name="target" /><slot /></div>'
  }

  const mountButton = (projects) => {
    return mount(ProjectsButton, {
      global: { plugins, stubs: { AppPopover: AppPopoverStub } },
      props: { projects }
    })
  }

  it('should render a single project button and no popover for one project', () => {
    const wrapper = mountButton(['banana-papers'])
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(1)
    expect(wrapper.find('.app-popover-stub').exists()).toBe(false)
  })

  it('should render nothing for zero projects', () => {
    const wrapper = mountButton([])
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(0)
    expect(wrapper.find('.app-popover-stub').exists()).toBe(false)
  })

  it('should accept a bare string as a single project', () => {
    const wrapper = mountButton('banana-papers')
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(1)
  })

  it('should render a popover with the pluralised count for several projects', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks', 'citrus-confidential'])
    expect(wrapper.find('.app-popover-stub').exists()).toBe(true)
    expect(wrapper.find('.projects-button__label').text()).toBe('3 projects')
  })

  it('should render exactly two thumbnails on the anchor whatever the project count', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks', 'citrus-confidential'])
    const thumbnails = wrapper.findAll('.projects-button__thumbnails__item')
    expect(thumbnails).toHaveLength(2)
  })

  it('should list one project button per project inside the popover', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential']
    const wrapper = mountButton(projects)
    const buttons = wrapper.find('.projects-button__list').findAllComponents({ name: 'ProjectButton' })
    expect(buttons).toHaveLength(3)
  })

  it('should pass each project through to its button in the popover', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks'])
    const [first] = wrapper.find('.projects-button__list').findAllComponents({ name: 'ProjectButton' })
    expect(first.props('project')).toBe('banana-papers')
  })
})
