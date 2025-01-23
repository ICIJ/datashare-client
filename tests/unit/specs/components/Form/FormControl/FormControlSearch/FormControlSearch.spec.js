import { shallowMount, mount } from '@vue/test-utils'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

describe('FormControlSearch', () => {
  it('renders without crashing', () => {
    const props = { modelValue: null }
    const wrapper = shallowMount(FormControlSearch, { props })
    expect(wrapper.exists()).toBe(true)
  })

  it('update input value', async () => {
    const props = { modelValue: 'search1' }
    const wrapper = mount(FormControlSearch, { props })
    await wrapper.find('input').setValue('search2')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted().input).toHaveLength(2)
    expect(wrapper.vm.modelValue).toBe('search2')
  })
})
