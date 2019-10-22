import Murmur from '@icij/murmur'
import VueI18n from 'vue-i18n'
import VueShortkey from 'vue-shortkey'
import Vuex from 'vuex'
import { createLocalVue, mount } from '@vue/test-utils'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'
import Document from '@/api/Document'
import en from '@/lang/en'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(VueShortkey)
const i18n = new VueI18n({ locale: 'en', messages: { en } })

describe('DocumentTranslatedContent.vue', () => {
  it('should show an English translation from French', async () => {
    const id = 'document-u'
    await store.commit('document/idAndRouting', { id })
    await store.commit('document/doc', {
      _id: id,
      _index: process.env.VUE_APP_ES_INDEX,
      _source: {
        content: 'Premier',
        content_translated: [
          { content: 'First', source_language: 'FRENCH', target_language: 'ENGLISH' }
        ],
        language: 'FRENCH'
      }
    })
    const document = store.state.document.doc
    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, store, propsData: { document } })
    expect(wrapper.vm.translatedContent).toBe('First')
  })

  it('should show no translations', async () => {
    const document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [],
        language: 'FRENCH'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, store, propsData: { document } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('should show no translations when the content is empty', async () => {
    const document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [
          { content: '', source_language: 'FRENCH', target_language: 'ENGLISH' }
        ],
        language: 'FRENCH'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, store, propsData: { document } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('shouldn\'t show italian translation', async () => {
    const document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [
          { content: 'Primo', source_language: 'FRENCH', target_language: 'ITALIAN' }
        ],
        language: 'FRENCH'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, store, propsData: { document } })
    await wrapper.vm.$refs.content.transformContent()
    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('should show an English translation from Italian', async () => {
    const document = new Document({
      _source: {
        content: 'Secondo',
        content_translated: [
          { content: 'Second', source_language: 'ITALIAN', target_language: 'ENGLISH' }
        ],
        language: 'ITALIAN'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, store, propsData: { document } })
    expect(wrapper.vm.translatedContent).toBe('Second')
  })

  it('should show an English translation from Italian then show the original', async () => {
    const document = new Document({
      _source: {
        content: 'Secondo',
        content_translated: [
          { content: 'Second', source_language: 'ITALIAN', target_language: 'ENGLISH' }
        ],
        language: 'ITALIAN'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, store, propsData: { document } })
    expect(wrapper.vm.translatedContent).toBe('Second')
    wrapper.vm.toggleOriginalContent()
    expect(wrapper.vm.translatedContent).toBeNull()
    wrapper.vm.toggleOriginalContent()
    expect(wrapper.vm.translatedContent).toBe('Second')
  })
})
