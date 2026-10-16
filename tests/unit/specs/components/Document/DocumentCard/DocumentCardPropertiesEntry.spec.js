import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'

describe('DocumentCardPropertiesEntry.vue', () => {
  const mountEntry = (props, slots = {}) => {
    const core = CoreSetup.init().useAll()
    return mount(DocumentCardPropertiesEntry, {
      global: { plugins: core.plugins },
      props,
      slots
    })
  }

  it('renders the document value for the given property', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' })
    expect(wrapper.text()).toContain('Jane Doe <jane@example.com>')
  })

  it('labels the entry with the property text from the search properties', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' })
    expect(wrapper.find('.visually-hidden').text()).toBe('Author:')
  })

  it('prefers an explicit title over the resolved one', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author', title: 'Written by' })
    expect(wrapper.find('.visually-hidden').text()).toBe('Written by:')
  })

  it('renders the icon by default', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' })
    expect(wrapper.find('.card-properties-entry__icon').exists()).toBe(true)
  })

  it('hides the icon when hideIcon is set', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author', hideIcon: true })
    expect(wrapper.find('.card-properties-entry__icon').exists()).toBe(false)
  })

  it('renders the slot instead of the document value when one is given', () => {
    const document = { author: 'Jane Doe <jane@example.com>' }
    const wrapper = mountEntry({ document, property: 'author' }, { default: '<b>slotted</b>' })
    expect(wrapper.text()).toContain('slotted')
    expect(wrapper.text()).not.toContain('Jane Doe')
  })

  it('falls back to a dash when the document has no such property', () => {
    const wrapper = mountEntry({ document: {}, property: 'author' })
    expect(wrapper.find('.card-properties-entry__value').text()).toBe('\u2014')
  })
})
