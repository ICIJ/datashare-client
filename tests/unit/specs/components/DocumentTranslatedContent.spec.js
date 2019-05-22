import Murmur from '@icij/murmur'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount } from '@vue/test-utils'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'
import Document from '@/api/Document'
import en from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { en } })

describe('DocumentTranslatedContent.vue', () => {
  it('should show an English translation from French', async () => {
    const document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [
          { content: 'First', source_language: 'FRENCH', target_language: 'ENGLISH' }
        ],
        language: 'FRENCH'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, propsData: { document } })
    expect(wrapper.find('.document-translated-content__translation__header__content').text()).toEqual('First')
  })

  it('should show no translations', async () => {
    const document = new Document({
      _source: {
        content: 'Premier',
        content_translated: [],
        language: 'FRENCH'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, propsData: { document } })
    expect(wrapper.find('.document-translated-content__original').text()).toEqual('Premier')
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

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, propsData: { document } })
    expect(wrapper.find('.document-translated-content__original').text()).toEqual('Premier')
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

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, propsData: { document } })
    expect(wrapper.find('.document-translated-content__original').text()).toEqual('Premier')
  })

  it('should show an English translation from Italian', async () => {
    const document = new Document({
      _source: {
        content: 'Secondo',
        content_translated: [
          { content: 'Second', source_language: 'ITLIAN', target_language: 'ENGLISH' }
        ],
        language: 'ITLIAN'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, propsData: { document } })
    expect(wrapper.find('.document-translated-content__translation__header__content').text()).toEqual('Second')
  })

  it('should show an English translation from Italian then show the original', async () => {
    const document = new Document({
      _source: {
        content: 'Secondo',
        content_translated: [
          { content: 'Second', source_language: 'ITLIAN', target_language: 'ENGLISH' }
        ],
        language: 'ITLIAN'
      }
    })

    const wrapper = mount(DocumentTranslatedContent, { localVue, i18n, propsData: { document } })
    expect(wrapper.find('.document-translated-content__translation__header__content').text()).toEqual('Second')
    wrapper.vm.toggleOriginalContent()
    expect(wrapper.find('.document-translated-content__translation__header__content').text()).toEqual('Secondo')
    wrapper.vm.toggleOriginalContent()
    expect(wrapper.find('.document-translated-content__translation__header__content').text()).toEqual('Second')
  })
})
