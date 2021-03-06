import ProjectSelector from '@/components/ProjectSelector'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Core } from '@/core'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('ProjectSelector.vue', () => {
  let wrapper

  it('should load projects list from config', () => {
    Murmur.config.merge({ groups_by_applications: { datashare: ['first-index', 'second-index', 'third-index'] } })
    wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { value: 'first-index' }, stubs: { 'b-form-select': false } })

    expect(wrapper.vm.projects).toHaveLength(3)
    // expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'default', text: 'default' }]))

    expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'first-index', text: 'first-index' }]))
    expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'second-index', text: 'second-index' }]))
    expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'third-index', text: 'third-index' }]))
  })

  it('should include projects only for which the user is a member', () => {
    Murmur.config.merge({ groups_by_applications: { datashare: ['first-index', 'second-index', 'third-index'] }, defaultProject: ['default'] })
    wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { value: 'first-index' }, stubs: { 'b-form-select': false } })

    expect(wrapper.vm.projects).toHaveLength(3)
    expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'first-index', text: 'first-index' }]))
    expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'second-index', text: 'second-index' }]))
    expect(wrapper.vm.projects).toEqual(expect.arrayContaining([{ value: 'third-index', text: 'third-index' }]))
  })

  it('should set default project to first project if value is empty', () => {
    Murmur.config.merge({ groups_by_applications: { datashare: ['first-index', 'second-index'] } })
    wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { value: '' }, stubs: { 'b-form-select': false } })

    expect(wrapper.vm.selectedProject).toEqual('first-index')
  })

  it('should set default project to first project if value is not in user project list', () => {
    Murmur.config.merge({ groups_by_applications: { datashare: ['first-index', 'second-index'] } })
    wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { value: 'default-index' }, stubs: { 'b-form-select': false } })

    expect(wrapper.vm.selectedProject).toEqual('first-index')
  })
})
