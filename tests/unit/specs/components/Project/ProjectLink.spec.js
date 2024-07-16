import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectLink from '@/components/Project/ProjectLink'

describe('ProjectLink.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll().useRouter()

  beforeAll(() => {
    config.set('projects', [{ name: 'local-datashare', label: 'Default' }])
  })

  it('should display the label of the project', () => {
    const project = 'local-datashare'
    const props = { project }
    const wrapper = shallowMount(ProjectLink, { global: { plugins, renderStubDefaultSlot: true }, props })
    expect(wrapper.text().trim()).toBe('Default')
  })

  it('should have a project thumbnail by default', () => {
    const project = 'local-datashare'
    const props = { project }
    const wrapper = shallowMount(ProjectLink, { global: { plugins, renderStubDefaultSlot: true }, props })
    expect(wrapper.findComponent({ name: 'ProjectThumbnail' }).exists()).toBeTruthy()
  })

  it('should hide the project thumbnail when `hideThumbnail` is set', () => {
    const project = 'local-datashare'
    const props = { project, hideThumbnail: true }
    const wrapper = shallowMount(ProjectLink, { global: { plugins }, props })
    expect(wrapper.findComponent({ name: 'ProjectThumbnail' }).exists()).toBeFalsy()
  })

  it('should be instanciated with an object instead of a project name', () => {
    const project = { name: 'local-datashare' }
    const props = { project }
    const wrapper = shallowMount(ProjectLink, { global: { plugins, renderStubDefaultSlot: true }, props })
    expect(wrapper.text().trim()).toBe('Default')
  })

  it('should display an "unknown" project', () => {
    const project = 'unknown-project-name'
    const props = { project }
    const wrapper = shallowMount(ProjectLink, { global: { plugins, renderStubDefaultSlot: true }, props })
    expect(wrapper.text().trim()).toBe('Unknown')
  })

  it('should be a router link', () => {
    const project = 'unknown-project-name'
    const props = { project }
    const wrapper = shallowMount(ProjectLink, { global: { plugins }, props })
    expect(wrapper.findComponent({ name: 'RouterLink' }).exists()).toBeTruthy()
  })

  it('should not be a router link when `disabled` is set', () => {
    const project = 'unknown-project-name'
    const props = { project, disabled: true }
    const wrapper = shallowMount(ProjectLink, { global: { plugins }, props })
    expect(wrapper.findComponent({ name: 'RouterLink ' }).exists()).toBeFalsy()
  })
})
