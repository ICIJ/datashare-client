import { createLocalVue, shallowMount } from '@vue/test-utils'

import { Core } from '@/core'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('DocumentLocalSearchInput.vue', () => {
  it('should display display search bar, searched term and count of occurrences', () => {
    const wrapper = shallowMount(DocumentLocalSearchInput, { localVue, store, propsData: { searchTerm: 'document' }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document-local-search-input').classes('document-local-search-input--pristine')).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__term').exists()).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__count').exists()).toBeTruthy()
  })
})
