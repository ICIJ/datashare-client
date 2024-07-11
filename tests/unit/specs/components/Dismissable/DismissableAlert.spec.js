import { mount } from '@vue/test-utils'

import DismissableAlert from '@/components/Dismissable/DismissableAlert'
import PhosphorIcon from '@/components/PhosphorIcon'
import ToastBody from '@/components/Dismissable/DismissableToastBody'

describe('DismissableAlert', () => {
  it('renders with default warning variant', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false
      }
    })
    expect(wrapper.vm.variant).toBe('warning')
  })

  it('renders with provided variant', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false,
        variant: 'danger'
      }
    })
    expect(wrapper.vm.variant).toBe('danger')
  })

  it('does not show if dismissed is true', () => {
    localStorage.setItem('dismissed-alert-test-alert', 'true')
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: true
      }
    })
    expect(wrapper.vm.show).toBe(false)
    localStorage.removeItem('dismissed-alert-test-alert')
  })

  it('shows if dismissed is false', () => {
    localStorage.setItem('dismissed-alert-test-alert', 'false')
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: true
      }
    })
    expect(wrapper.vm.show).toBe(true)
    localStorage.removeItem('dismissed-alert-test-alert')
  })

  it('dismisses the alert when button is clicked', async () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: true
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.show).toBe(false)
  })

  it('applies the correct class to the link based on the variant', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false,
        variant: 'success'
      }
    })
    expect(wrapper.find('button').classes()).toContain('btn-outline-success')
  })

  it('renders with default link label', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false
      }
    })
    expect(wrapper.find('button').text()).toBe("Don't show this again")
  })

  it('renders with provided link label', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false,
        linkLabel: 'Hide this alert'
      }
    })
    expect(wrapper.find('button').text()).toBe('Hide this alert')
  })

  it('does not render the button if noButton is true', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false,
        noButton: true
      }
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders the icon if noIcon is false', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false,
        icon: 'info',
        noIcon: false
      }
    })
    expect(wrapper.findComponent(PhosphorIcon).exists()).toBeTruthy()
    expect(wrapper.findComponent(ToastBody).props('icon')).toBe('info')
  })

  it('does not render the icon if noIcon is true', () => {
    const wrapper = mount(DismissableAlert, {
      props: {
        name: 'test-alert',
        persist: false,
        noIcon: true
      }
    })
    expect(wrapper.findComponent(PhosphorIcon).exists()).toBeFalsy()
  })
})
