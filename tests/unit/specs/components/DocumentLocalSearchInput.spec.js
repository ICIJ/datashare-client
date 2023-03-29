import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('DocumentLocalSearchInput.vue', () => {
  it('should display display search bar, searched term and count of occurrences', () => {
    const wrapper = shallowMount(DocumentLocalSearchInput, {
      localVue,
      store,
      propsData: { searchTerm: 'document' },
      mocks: { $t: (msg) => msg }
    })

    expect(wrapper.find('.document-local-search-input').classes('document-local-search-input--pristine')).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__term').exists()).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__count').exists()).toBeTruthy()
  })

  it('should disable input when disabled props is true', async () => {
    const wrapper = shallowMount(DocumentLocalSearchInput, {
      localVue,
      store,
      propsData: { disabled: false },
      mocks: { $t: (msg) => msg }
    })
    expect(wrapper.find('.document-local-search-input__term').attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('.document-local-search-input__term').attributes('disabled')).toBe('disabled')
  })
})
