import { shallowMount, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentGlobalSearchTermsEntry from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTermsEntry'
import ButtonIcon from '@/components/Button/ButtonIcon'
describe('DocumentGlobalSearchTermsEntry', () => {
  let plugins
  beforeEach(() => {
    const core = CoreSetup.init().useAll()
    plugins = core.plugins
  })
  it('renders without crashing', () => {
    const props = { term: {} }
    const wrapper = shallowMount(DocumentGlobalSearchTermsEntry, {
      global: { plugins },
      props
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('shows the label', () => {
    const props = { term: { label: 'test' } }
    const wrapper = shallowMount(DocumentGlobalSearchTermsEntry, {
      global: { plugins },
      props
    })
    expect(wrapper.find('.document-global-search-terms-entry__label').text()).toBe('test')
  })
  it('shows in tags text when there is tags', async () => {
    const props = { term: { label: 'test', count: 0, tags: 0 } }

    const wrapper = shallowMount(DocumentGlobalSearchTermsEntry, {
      global: { plugins },
      props
    })
    expect(wrapper.find('.document-global-search-terms-entry__tags').exists()).toBe(false)
    await wrapper.setProps({ term: { label: 'test', count: 0, tags: 1 } })
    expect(wrapper.find('.document-global-search-terms-entry__tags').exists()).toBe(true)
  })
  it('shows in metadata text when there is metadata', async () => {
    const props = { term: { label: 'test', count: 0, metadata: 0 } }

    const wrapper = shallowMount(DocumentGlobalSearchTermsEntry, {
      global: { plugins },
      props
    })
    expect(wrapper.find('.document-global-search-terms-entry__metadata').exists()).toBe(false)
    await wrapper.setProps({ term: { label: 'test', count: 0, metadata: 1 } })
    expect(wrapper.find('.document-global-search-terms-entry__metadata').exists()).toBe(true)
  })

  it('shows counter pill in button icon when count is positive', async () => {
    const props = { term: { label: 'test', count: 0 } }

    const wrapper = shallowMount(DocumentGlobalSearchTermsEntry, {
      global: { plugins },
      props
    })
    expect(wrapper.find('button-icon').attributes('counter')).toBeUndefined()
    await wrapper.setProps({ term: { label: 'test', count: 1, tags: 1 } })
    expect(wrapper.find('button-icon').attributes('counter')).toBe('1')
  })
})
