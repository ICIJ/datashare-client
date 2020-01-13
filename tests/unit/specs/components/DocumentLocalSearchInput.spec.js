import { createLocalVue, shallowMount } from '@vue/test-utils'

import { App } from '@/main'
import DocumentLocalSearchInput from '@/components/DocumentLocalSearchInput'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('DocumentLocalSearchInput.vue', () => {
  it('should display display search bar, searched term and count of occurrences', () => {
    const wrapper = shallowMount(DocumentLocalSearchInput, { localVue, store, propsData: { searchTerm: { label: 'document' } }, mocks: { $t: msg => msg } })

    expect(wrapper.find('.document-local-search-input').classes('document-local-search-input--pristine')).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__term').exists()).toBeTruthy()
    expect(wrapper.find('.document-local-search-input__count').exists()).toBeTruthy()
    console.log(wrapper.find('.document-local-search-input__count').html())
  })
})
