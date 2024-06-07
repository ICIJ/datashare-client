import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ProjectSelector from '@/components/ProjectSelector'

describe('ProjectSelector.vue', () => {
  const { plugins, config } = CoreSetup.init().useAll()

  describe('single value selector', () => {
    let wrapper

    beforeEach(() => {
      const projects = [{ name: 'second-index' }, { name: 'third-index' }]
      config.merge({ defaultProject: 'first-index', projects })

      wrapper = shallowMount(ProjectSelector, {
        global: {
          plugins,
          renderStubDefaultSlot: true
        },
        props: {
          value: 'first-index'
        }
      })
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
      const projects = [{ name: 'first-index' }, { name: 'second-index' }, { name: 'third-index' }]
      config.merge({ projects, defaultProject: 'first-index' })

      wrapper = shallowMount(ProjectSelector, {
        global: {
          plugins,
          renderStubDefaultSlot: true
        },
        props: {
          modelValue: ['first-index'],
          multiple: true
        }
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
      await wrapper.setProps({ modelValue: ['first-index', 'second-index'] })
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
