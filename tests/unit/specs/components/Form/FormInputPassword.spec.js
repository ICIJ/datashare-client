import { shallowMount, mount } from '@vue/test-utils'
import { ButtonIcon } from '@icij/murmur'

import FormInputPassword from '@/components/Form/FormInputPassword'
import CoreSetup from '~tests/unit/CoreSetup'

describe('FormInputPassword', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  it('renders without crashing', () => {
    const wrapper = shallowMount(FormInputPassword, { global })
    expect(wrapper.exists()).toBe(true)
  })

  it('defaults the input type to "password"', () => {
    const wrapper = mount(FormInputPassword, { global })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('toggles the input type to "text" then back to "password" when the eye icon is clicked', async () => {
    const wrapper = mount(FormInputPassword, { global })
    const toggle = wrapper.findComponent(ButtonIcon)

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')

    await toggle.trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('forwards attrs to the underlying input', () => {
    const attrs = { placeholder: 'Enter your password' }
    const wrapper = mount(FormInputPassword, { global, attrs })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your password')
  })

  it('emits update:modelValue when the input value changes', async () => {
    const props = { modelValue: '' }
    const wrapper = mount(FormInputPassword, { global, props })
    await wrapper.find('input').setValue('s3cr3t')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted[emitted.length - 1]).toEqual(['s3cr3t'])
  })
})
