import { mount } from '@vue/test-utils'

import DisplayEmpty from '@/components/Display/DisplayEmpty'

describe('DisplayEmpty', () => {
  function mountComponent(props = {}, slots = {}) {
    return mount(DisplayEmpty, {
      props,
      slots
    })
  }

  describe('when value is provided', () => {
    it('should display the value', () => {
      const wrapper = mountComponent({ value: 'foo' })
      expect(wrapper.text()).toBe('foo')
    })

    it('should not have the empty modifier class', () => {
      const wrapper = mountComponent({ value: 'foo' })
      expect(wrapper.find('.display-empty--empty').exists()).toBeFalsy()
    })

    it('should use default slot content when provided', () => {
      const wrapper = mountComponent({ value: 'foo' }, { default: '<strong>custom</strong>' })
      expect(wrapper.find('strong').exists()).toBeTruthy()
      expect(wrapper.text()).toBe('custom')
    })
  })

  describe('when value is null', () => {
    it('should display dash', () => {
      const wrapper = mountComponent({ value: null })
      expect(wrapper.text()).toBe('-')
    })

    it('should have the empty modifier class', () => {
      const wrapper = mountComponent({ value: null })
      expect(wrapper.find('.display-empty--empty').exists()).toBeTruthy()
    })
  })

  describe('when value is not provided', () => {
    it('should display dash', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toBe('-')
    })

    it('should have the empty modifier class', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.display-empty--empty').exists()).toBeTruthy()
    })
  })

  describe('when value is empty string', () => {
    it('should display dash', () => {
      const wrapper = mountComponent({ value: '' })
      expect(wrapper.text()).toBe('-')
    })

    it('should have the empty modifier class', () => {
      const wrapper = mountComponent({ value: '' })
      expect(wrapper.find('.display-empty--empty').exists()).toBeTruthy()
    })
  })

  describe('empty slot', () => {
    it('should use custom empty slot content', () => {
      const wrapper = mountComponent({ value: null }, { empty: '<em>N/A</em>' })
      expect(wrapper.find('em').exists()).toBeTruthy()
      expect(wrapper.text()).toBe('N/A')
    })
  })

  describe('value types', () => {
    it('should handle number values', () => {
      const wrapper = mountComponent({ value: 42 })
      expect(wrapper.text()).toBe('42')
      expect(wrapper.find('.display-empty--empty').exists()).toBeFalsy()
    })

    it('should handle zero as a valid value', () => {
      const wrapper = mountComponent({ value: 0 })
      expect(wrapper.text()).toBe('-')
    })

    it('should handle boolean true as a valid value', () => {
      const wrapper = mountComponent({ value: true })
      expect(wrapper.text()).toBe('true')
      expect(wrapper.find('.display-empty--empty').exists()).toBeFalsy()
    })

    it('should handle boolean false as empty', () => {
      const wrapper = mountComponent({ value: false })
      expect(wrapper.text()).toBe('-')
    })
  })
})
