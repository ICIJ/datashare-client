import { shallowMount } from '@vue/test-utils'

import DismissableToastBody from '@/components/Dismissable/DismissableToastBody'
import CoreSetup from '~tests/unit/CoreSetup'

describe('DismissableToastBody', () => {
  let global

  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    global = { plugins: core.plugins }
  })

  it('renders with default variant when toastProps type is not provided', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: {},
        body: 'Test body'
      }
    })
    expect(wrapper.vm.variant).toBe('action')
  })

  it('renders with error variant when toastProps type is error', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: { type: 'error' },
        body: 'Test body'
      }
    })
    expect(wrapper.vm.variant).toBe('danger')
  })

  it('applies close-on-click class when toastProps.closeOnClick is true', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: { closeOnClick: true },
        body: 'Test body'
      }
    })
    expect(wrapper.find('.toast-body').classes()).toContain('toast-body--close-on-click')
  })

  it('shows link section if href is provided', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: {},
        body: 'Test body',
        href: 'https://example.com'
      }
    })
    expect(wrapper.find('.toast-body__link').exists()).toBe(true)
  })

  it('uses default link label if linkLabel is not provided', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: {},
        body: 'Test body',
        href: 'https://example.com'
      }
    })
    expect(wrapper.find('a').text()).toBe('See more')
  })

  it('uses provided link label if linkLabel is specified', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: {},
        body: 'Test body',
        href: 'https://example.com',
        linkLabel: 'More Info'
      }
    })
    expect(wrapper.find('a').text()).toBe('More Info')
  })

  it('applies the correct class to the link based on the variant', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: { type: 'default' },
        body: 'Test body',
        href: 'https://example.com'
      }
    })
    expect(wrapper.find('a').classes()).toContain('btn-outline-action')
  })

  it('renders title if provided', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: {},
        body: 'Test body',
        title: 'Test Title'
      }
    })
    expect(wrapper.find('.toast-body__content__title').text()).toBe('Test Title')
  })

  it('renders the body content correctly', () => {
    const wrapper = shallowMount(DismissableToastBody, {
      global,
      props: {
        toastProps: {},
        body: 'Test body'
      }
    })
    expect(wrapper.find('.toast-body__content__body').text()).toBe('Test body')
  })
})
