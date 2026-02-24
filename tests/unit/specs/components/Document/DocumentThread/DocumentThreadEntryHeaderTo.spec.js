import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntryHeaderTo from '@/components/Document/DocumentThread/DocumentThreadEntryHeaderTo'

describe('DocumentThreadEntryHeaderTo.vue', () => {
  let core

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntryHeaderTo, {
      global: {
        plugins: core.plugins
      },
      props: {
        email: {
          id: 'email_01',
          messageTo: 'recipient1@example.com,recipient2@example.com'
        },
        ...props
      }
    })
  }

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('should render the "to" label', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.document-thread-entry-header-to').exists()).toBe(true)
  })

  it('should render a DisplayEmail for each recipient', () => {
    const wrapper = createWrapper()
    const emails = wrapper.findAll('display-email-stub')
    expect(emails).toHaveLength(2)
  })

  it('should render a single recipient', () => {
    const wrapper = createWrapper({
      email: { id: 'email_01', messageTo: 'single@example.com' }
    })
    const emails = wrapper.findAll('display-email-stub')
    expect(emails).toHaveLength(1)
  })
})
