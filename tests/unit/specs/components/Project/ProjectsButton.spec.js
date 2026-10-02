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

  it('should render a placeholder for zero projects', () => {
    const wrapper = mountButton([])
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(0)
    expect(wrapper.find('.app-popover-stub').exists()).toBe(false)
    expect(wrapper.find('.projects-button__empty').text()).toBe('-')
  })

  // A task without a project yields a list of holes, as in [item.args?.defaultProject],
  // which used to reach ProjectButton as an undefined project and throw.
  it('should render a placeholder for a list of missing projects', () => {
    const wrapper = mountButton([undefined])
    expect(wrapper.findAllComponents({ name: 'ProjectButton' })).toHaveLength(0)
    expect(wrapper.find('.projects-button__empty').text()).toBe('-')
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

  it('should render a popover for exactly two projects, the hasPopover boundary', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks'])
    expect(wrapper.find('.app-popover-stub').exists()).toBe(true)
    expect(wrapper.find('.projects-button__label').text()).toBe('2 projects')
  })

  it('should render exactly two thumbnails on the anchor whatever the project count', () => {
    const wrapper = mountButton(['banana-papers', 'lux-leaks', 'citrus-confidential'])
    const stack = wrapper.findComponent({ name: 'ProjectThumbnailStack' })
    const thumbnails = stack.findAllComponents({ name: 'ProjectThumbnail' })
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

  // Unlike the other tests, this one mounts the real AppPopover (no stub) because the
  // close-button check needs the real AppPopoverHeader, which the stub never renders.
  // The popover content is teleported into `document.body` regardless of visibility, so
  // the header can be found there even though jsdom never toggles it to `display: block`.
  it('should render a popover header with no close button', () => {
    const projects = ['banana-papers', 'lux-leaks', 'citrus-confidential']
    const wrapper = mount(ProjectsButton, {
      attachTo: document.body,
      global: { plugins },
      props: { projects }
    })

    const header = document.body.querySelector('.app-popover-header')
    expect(header).not.toBeNull()
    expect(document.body.querySelector('.app-popover-header__close')).toBeNull()

    wrapper.unmount()
    document.body.innerHTML = ''
  })
})
