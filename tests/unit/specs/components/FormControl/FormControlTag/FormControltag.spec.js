import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FormControlTag from '@/components/FormControl/FormControlTag/FormControlTag'

describe('FormControlTag', () => {
  let plugins

  beforeAll(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })

  it('should render the component', () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: [],
        inputValue: ''
      }
    })
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should update inputValueTrigger when inputValue changes', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: [],
        inputValue: ''
      }
    })

    await wrapper.setProps({ inputValue: 'new value' })
    expect(wrapper.vm.inputValueTrigger).toBe('new value')
  })

  it('should emit update:modelValue when addTag is called', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: [],
        inputValue: ''
      }
    })

    wrapper.vm.addTag('tag1')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([['tag1']])
  })

  it('should not add duplicate tags if noDuplicates is true', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: ['tag1'],
        noDuplicates: true,
        inputValue: ''
      }
    })

    wrapper.vm.addTag('tag1')
    expect(wrapper.emitted()['update:modelValue']).toBeFalsy()
  })

  it('should split tags by separators', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: [],
        inputValue: '',
        separator: [',', ';']
      }
    })

    wrapper.vm.addTag('tag1,tag2;tag3')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([['tag1', 'tag2', 'tag3']])
  })

  it('should remove a tag', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: ['tag1', 'tag2'],
        inputValue: ''
      }
    })

    wrapper.vm.removeTag('tag1')
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([['tag2']])
  })

  it('should remove the last tag if inputValueTrigger is empty', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: ['tag1', 'tag2'],
        inputValue: ''
      }
    })

    wrapper.vm.inputValueTrigger = ''
    wrapper.vm.removeLastTag()
    expect(wrapper.emitted()['update:modelValue'][0]).toEqual([['tag1']])
  })

  it('should validate a tag correctly', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: [],
        inputValue: '',
        noCreate: true,
        options: ['tag1', 'tag2']
      }
    })

    expect(wrapper.vm.tagValidator('tag1')).toBeTruthy()
    expect(wrapper.vm.tagValidator('invalidTag')).toBeFalsy()
  })

  it('should compute class list correctly', async () => {
    const wrapper = mount(FormControlTag, {
      global: {
        plugins
      },
      props: {
        modelValue: [],
        inputValue: ''
      }
    })

    wrapper.vm.showDropdown = true
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.classList).toEqual({ 'form-control-tag--show-dropdown': true })
  })
})
