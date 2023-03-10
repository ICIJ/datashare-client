import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import ProjectSelector from '@/components/ProjectSelector'
import { Core } from '@/core'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('ProjectSelector.vue', () => {
  describe('single value selector', () => {
    let wrapper

    beforeEach(() => {
      Murmur.config.merge({
        defaultProject: 'first-index',
        groups_by_applications: { datashare: ['second-index', 'third-index'] }
      })
      wrapper = shallowMount(ProjectSelector, { localVue, store, propsData: { value: 'first-index' } })
    })

    it('should load projects list from config, not including the default project', () => {
      const { projectOptions } = wrapper.vm
      expect(projectOptions).toHaveLength(2)
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'second-index', text: 'Second Index' }])
      )
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'third-index', text: 'Third Index' }])
      )
    })

    it('should create a select box', () => {
      expect(wrapper.find('b-form-select-stub').exists()).toBeTruthy()
    })
  })

  describe('multiple values selector', () => {
    let wrapper

    beforeEach(() => {
      Murmur.config.merge({ groups_by_applications: { datashare: ['first-index', 'second-index', 'third-index'] } })
      wrapper = shallowMount(ProjectSelector, {
        localVue,
        store,
        propsData: { value: ['first-index'], multiple: true }
      })
    })

    it('should load projects list from config with one disabled option', () => {
      const { projectOptions } = wrapper.vm
      expect(projectOptions).toHaveLength(3)
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: true, value: 'first-index', text: 'First Index' }])
      )
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'second-index', text: 'Second Index' }])
      )
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'third-index', text: 'Third Index' }])
      )
    })

    it('should create a checkbox froup', () => {
      expect(wrapper.find('b-form-checkbox-group-stub').exists()).toBeTruthy()
    })

    it('should  have no disable option', async () => {
      await wrapper.setProps({ value: ['first-index', 'second-index'] })
      const { projectOptions } = wrapper.vm
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'first-index', text: 'First Index' }])
      )
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'second-index', text: 'Second Index' }])
      )
      expect(projectOptions).toEqual(
        expect.arrayContaining([{ disabled: false, value: 'third-index', text: 'Third Index' }])
      )
    })
  })
})
