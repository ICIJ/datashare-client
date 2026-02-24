import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntryExcerpt from '@/components/Document/DocumentThread/DocumentThreadEntryExcerpt'

describe('DocumentThreadEntryExcerpt.vue', () => {
  let core

  const mockEmail = {
    id: 'email_01',
    excerpt: 'This is an email excerpt...'
  }

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntryExcerpt, {
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
    core = CoreSetup.init().useAll()
  })

  it('should render the excerpt text', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('This is an email excerpt...')
  })

  it('should have the excerpt class', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.document-thread-entry-excerpt').exists()).toBe(true)
  })
})
