import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntryHeader from '@/components/Document/DocumentThread/DocumentThreadEntryHeader'

describe('DocumentThreadEntryHeader.vue', () => {
  let core

  beforeAll(() => {
    core = CoreSetup.init().useAll()
  })

  const mockEmail = {
    id: 'email_01',
    messageFrom: 'sender@example.com',
    messageTo: 'recipient1@example.com,recipient2@example.com',
    creationDate: new Date('2020-12-04T00:00:01Z'),
    creationDateHuman: 'December 4, 2020',
    routerParams: { id: 'email_01', index: 'test-index', routing: 'email_01' },
    excerpt: 'This is an email excerpt...'
  }

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntryHeader, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
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

  it('should emit toggle on click', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.document-thread-entry-header').trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('should show toggler for a non-active email', () => {
    const wrapper = createWrapper({ active: false })
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryHeaderToggler' }).exists()).toBe(true)
  })

  it('should not show toggler for the active email', () => {
    const wrapper = createWrapper({ active: true })
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryHeaderToggler' }).exists()).toBe(false)
  })

  it('should show DocumentThreadEntryHeaderTo when expanded with messageTo', () => {
    const wrapper = createWrapper({ expanded: true })
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryHeaderTo' }).exists()).toBe(true)
  })

  it('should not show DocumentThreadEntryHeaderTo when collapsed', () => {
    const wrapper = createWrapper({ expanded: false })
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryHeaderTo' }).exists()).toBe(false)
  })

  it('should show DocumentThreadEntryExcerpt when collapsed', () => {
    const wrapper = createWrapper({ expanded: false })
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryExcerpt' }).exists()).toBe(true)
  })

  it('should not show DocumentThreadEntryExcerpt when expanded', () => {
    const wrapper = createWrapper({ expanded: true })
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryExcerpt' }).exists()).toBe(false)
  })

  it('should always show DocumentThreadEntryHeaderFrom', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryHeaderFrom' }).exists()).toBe(true)
  })

  it('should always show DocumentThreadEntryHeaderCreationDate', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'DocumentThreadEntryHeaderCreationDate' }).exists()).toBe(true)
  })
})
