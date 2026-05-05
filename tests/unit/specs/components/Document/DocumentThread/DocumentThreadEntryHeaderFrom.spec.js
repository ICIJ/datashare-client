import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntryHeaderFrom from '@/components/Document/DocumentThread/DocumentThreadEntryHeaderFrom'

describe('DocumentThreadEntryHeaderFrom.vue', () => {
  let core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  const mockEmail = {
    id: 'email_01',
    messageFrom: 'sender@example.com'
  }

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntryHeaderFrom, {
      global: {
        plugins: core.plugins
      },
      props: {
        email: mockEmail,
        ...props
      }
    })
  }

  beforeEach(() => {
    core.createPinia()
  })

  it('should render a DisplayEmail component', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('display-email-stub').exists()).toBe(true)
  })

  it('should pass the messageFrom value to DisplayEmail', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('display-email-stub').attributes('value')).toBe('sender@example.com')
  })

  it('should use strong tag for DisplayEmail', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('display-email-stub').attributes('tag')).toBe('strong')
  })
})
