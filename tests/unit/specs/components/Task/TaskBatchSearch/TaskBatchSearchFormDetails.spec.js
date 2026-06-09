import { defineComponent } from 'vue'
import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchFormDetails from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormDetails'
import ProjectDropdownSelector from '@/components/Project/ProjectDropdownSelector/ProjectDropdownSelector'

// A passthrough stub for FormFieldsetI18n that forwards its name and
// descriptionKey props as DOM attributes so we can assert on them.
const FormFieldsetI18nStub = defineComponent({
  props: {
    name: { type: String, default: '' },
    descriptionKey: { type: String, default: undefined }
  },
  template: '<div :data-name="name" :data-description-key="descriptionKey"><slot /></div>'
})

describe('TaskBatchSearchFormDetails', () => {
  let plugins

  beforeEach(() => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    plugins = core.plugins
    core.config.set('projects', [{ name: 'local-datashare' }])
  })

  function mountWith(props = {}) {
    return shallowMount(TaskBatchSearchFormDetails, {
      global: {
        plugins,
        // shallowMount stubs child components. Use passthrough stubs for the
        // layout wrappers so their slot content (inputs, selectors) renders.
        // ModeServerOnly hides its slot in LOCAL mode (the test default).
        stubs: {
          FormStep: { template: '<div><slot /></div>' },
          FormFieldsetI18n: FormFieldsetI18nStub,
          ModeServerOnly: { template: '<slot />' }
        }
      },
      props: {
        name: 'My batch',
        description: 'desc',
        visibility: false,
        selectedProjects: [{ name: 'local-datashare' }],
        ...props
      }
    })
  }

  it('leaves all fields enabled by default', () => {
    const wrapper = mountWith()
    // shallowMount serializes :disabled="false" as the string "false" — assert it
    // precisely so a regression that drops the attribute entirely is caught.
    expect(wrapper.find('b-form-input-stub').attributes('disabled')).toBe('false')
    expect(wrapper.find('b-form-textarea-stub').attributes('disabled')).toBe('false')
    expect(wrapper.findComponent(ProjectDropdownSelector).attributes('disabled')).toBe('false')
  })

  it('disables the name input when disabledName is true', () => {
    const wrapper = mountWith({ disabledName: true })
    expect(wrapper.find('b-form-input-stub').attributes('disabled')).toBe('true')
  })

  it('disables the description textarea when disabledDescription is true', () => {
    const wrapper = mountWith({ disabledDescription: true })
    expect(wrapper.find('b-form-textarea-stub').attributes('disabled')).toBe('true')
  })

  it('disables the projects selector when disabledProjects is true', () => {
    const wrapper = mountWith({ disabledProjects: true })
    expect(wrapper.findComponent(ProjectDropdownSelector).attributes('disabled')).toBe('true')
  })

  it('renders the projects fieldset by default', () => {
    const wrapper = mountWith()
    expect(wrapper.find('[data-name="projects"]').exists()).toBe(true)
    expect(wrapper.findComponent(ProjectDropdownSelector).exists()).toBe(true)
  })

  it('hides the projects fieldset entirely when hideProjects is true', () => {
    const wrapper = mountWith({ hideProjects: true })
    expect(wrapper.find('[data-name="projects"]').exists()).toBe(false)
    expect(wrapper.findComponent(ProjectDropdownSelector).exists()).toBe(false)
  })

  it('suppresses the visibility hint when hideVisibilityHint is true', () => {
    const wrapper = mountWith({ hideVisibilityHint: true })
    const visibilityFieldset = wrapper.find('[data-name="visibility"]')
    expect(visibilityFieldset.attributes('data-description-key')).toBe('')
  })

  it('keeps the default visibility hint when hideVisibilityHint is false', () => {
    const wrapper = mountWith()
    const visibilityFieldset = wrapper.find('[data-name="visibility"]')
    expect(visibilityFieldset.attributes('data-description-key')).toBeUndefined()
  })
})
