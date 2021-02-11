import { toLower } from 'lodash'
import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'

describe('DocumentTranslatedContent.vue', () => {
  const { localVue, store } = Core.init(createLocalVue()).useAll()
  const index = toLower('DocumentTabDetails')
  let wrapper = null

  it('should show no translations', async () => {
    store.commit('document/doc', {
      _id: 'document-without-translation',
      _index: index,
      _source: {
        content: 'Premier',
        content_translated: [],
        language: 'FRENCH'
      }
    })
    const document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('should show no translations when the content is empty', async () => {
    store.commit('document/doc', {
      _id: 'document-without-content',
      _index: index,
      _source: {
        content: 'Premier',
        content_translated: [
          { content: '', source_language: 'FRENCH', target_language: 'ENGLISH' }
        ],
        language: 'FRENCH'
      }
    })
    const document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('shouldn\'t show italian translation', async () => {
    store.commit('document/doc', {
      _id: 'document-without-a-translation-in-italian',
      _index: index,
      _source: {
        content: 'Premier',
        content_translated: [
          { content: 'Primo', source_language: 'FRENCH', target_language: 'ITALIAN' }
        ],
        language: 'FRENCH'
      }
    })

    const document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })
})
