import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentThreadEntry from '@/components/Document/DocumentThread/DocumentThreadEntry'

describe('DocumentThreadEntry.vue', () => {
  let core

  const mockEmail = {
    id: 'email_01',
    messageFrom: 'sender@example.com',
    messageTo: 'recipient1@example.com,recipient2@example.com',
    creationDate: new Date('2020-12-04T00:00:01Z'),
    creationDateHuman: 'December 4, 2020',
    routerParams: { id: 'email_01', index: 'test-index', routing: 'email_01' },
    excerpt: 'This is an email excerpt...'
  }

  const mockDocument = {
    id: 'active_doc',
    index: 'test-index'
  }

  function createWrapper(props = {}) {
    return shallowMount(DocumentThreadEntry, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: {
        email: mockEmail,
        document: mockDocument,
        ...props
      }
    })
  }

  beforeEach(() => {
    core = CoreSetup.init().useAll()
  })

  it('should show DocumentTranslation when expanded', () => {
    const wrapper = createWrapper({ expanded: true })
    expect(wrapper.find('document-translation-stub').exists()).toBe(true)
  })

  it('should hide DocumentTranslation when collapsed', () => {
    const wrapper = createWrapper({ expanded: false })
    expect(wrapper.find('document-translation-stub').exists()).toBe(false)
  })

  it('should pass document prop to DocumentTranslation when active', () => {
    const wrapper = createWrapper({ active: true, expanded: true })
    const translation = wrapper.find('document-translation-stub')
    expect(translation.attributes('document')).toBeTruthy()
  })

  it('should pass email as document to DocumentTranslation when not active', () => {
    const wrapper = createWrapper({ active: false, expanded: true })
    const translation = wrapper.find('document-translation-stub')
    expect(translation.attributes('document')).toBeTruthy()
  })

  it('should add active class when active prop is true', () => {
    const wrapper = createWrapper({ active: true })
    expect(wrapper.find('.document-thread-entry--active').exists()).toBe(true)
  })

  it('should not add active class when active prop is false', () => {
    const wrapper = createWrapper({ active: false })
    expect(wrapper.find('.document-thread-entry--active').exists()).toBe(false)
  })

  it('should emit toggle when header emits toggle', () => {
    const wrapper = createWrapper()
    wrapper.findComponent({ name: 'DocumentThreadEntryHeader' }).vm.$emit('toggle')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('should pass active and expanded props to header', () => {
    const wrapper = createWrapper({ active: true, expanded: true })
    const header = wrapper.findComponent({ name: 'DocumentThreadEntryHeader' })
    expect(header.props('active')).toBe(true)
    expect(header.props('expanded')).toBe(true)
  })
})
