import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'

import { App } from '@/main'
import Document from '@/api/resources/Document'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'

const { localVue, store } = App.init(createLocalVue()).useAll()

describe('DocumentTranslatedContent.vue', () => {
  const index = toLower('DocumentTabDetails')
  let document, wrapper

  it('should show an English translation from French', async () => {
    const id = 'document'
    await store.commit('document/idAndRouting', { id })
    await store.commit('document/doc', {
      _id: id,
      _index: index,
      _source: {
        content: 'Premier',
        content_translated: [
          { content: 'First', source_language: 'FRENCH', target_language: 'ENGLISH' }
        ],
        language: 'FRENCH'
      }
    })
    document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.translatedContent).toBe('First')
  })

  it('should show no translations', async () => {
    document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [],
        language: 'FRENCH'
      }
    })

    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('should show no translations when the content is empty', async () => {
    document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [
          { content: '', source_language: 'FRENCH', target_language: 'ENGLISH' }
        ],
        language: 'FRENCH'
      }
    })

    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('shouldn\'t show italian translation', async () => {
    document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [
          { content: 'Primo', source_language: 'FRENCH', target_language: 'ITALIAN' }
        ],
        language: 'FRENCH'
      }
    })

    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('should show an English translation from Italian', () => {
    document = new Document({
      _source: {
        content: 'Secondo',
        content_translated: [
          { content: 'Second', source_language: 'ITALIAN', target_language: 'ENGLISH' }
        ],
        language: 'ITALIAN'
      }
    })

    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.translatedContent).toBe('Second')
  })

  it('should show an English translation from Italian then show the original', () => {
    document = new Document({
      _source: {
        content: 'Secondo',
        content_translated: [
          { content: 'Second', source_language: 'ITALIAN', target_language: 'ENGLISH' }
        ],
        language: 'ITALIAN'
      }
    })

    wrapper = mount(DocumentTranslatedContent, { localVue, store, propsData: { document }, mocks: { $t: msg => msg } })
    expect(wrapper.vm.translatedContent).toBe('Second')
    wrapper.vm.toggleOriginalContent()
    expect(wrapper.vm.translatedContent).toBeNull()
    wrapper.vm.toggleOriginalContent()
    expect(wrapper.vm.translatedContent).toBe('Second')
  })
})
