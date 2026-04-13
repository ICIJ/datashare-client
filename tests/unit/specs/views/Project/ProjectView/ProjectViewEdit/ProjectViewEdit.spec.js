import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup.js'
import ProjectViewEdit from '@/views/Project/ProjectView/ProjectViewEdit/ProjectViewEdit.vue'

describe('ProjectViewEdit.vue', () => {
  let core

  beforeEach(() => {
    core = CoreSetup.init().useI18n()
    core.config.set('projects', [{ name: 'local-datashare', label: 'Default', sourcePath: '/' }])
  })
  it('renders two tab navigation entries', () => {
    const props = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props
    })
    expect(wrapper.findAllComponents({ name: 'TabGroupNavigationEntry' })).toHaveLength(2)
  })

  it('first tab links to project.view.edit.details', () => {
    const props = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props
    })
    const entries = wrapper.findAllComponents({ name: 'TabGroupNavigationEntry' })
    expect(entries[0].props('to')).toMatchObject({ name: 'project.view.edit.details' })
  })

  it('second tab links to project.view.edit.banners', () => {
    const props = { name: 'local-datashare' }
    const wrapper = shallowMount(ProjectViewEdit, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props
    })
    const entries = wrapper.findAllComponents({ name: 'TabGroupNavigationEntry' })
    expect(entries[1].props('to')).toMatchObject({ name: 'project.view.edit.banners' })
  })
})
