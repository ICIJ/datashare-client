import { shallowMount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'

const { plugins } = CoreSetup.init().useAll()

describe('DocumentLocalSearchInput.vue', () => {
  it('should display display search bar, searched term and count of occurrences', () => {
    const wrapper = shallowMount(DocumentLocalSearchInput, {
      global: {
        plugins,
        renderStubDefaultSlot: true
      },
      props: { modelValue: 'document' }
    })
    expect(wrapper.find('.document-local-search-input').classes('document-local-search-input--pristine')).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__term').exists()).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__count').exists()).toBeTruthy()
  })

  it('should disable input when disabled props is true', async () => {
    const wrapper = shallowMount(DocumentLocalSearchInput, {
      global: {
        plugins
      },
      props: { disabled: false }
    })
    expect(wrapper.find('.document-local-search-input__term').attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('.document-local-search-input__term').attributes('disabled')).toBeDefined()
  })
})
