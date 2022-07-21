import { toLower } from 'lodash'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { createLocalVue, mount } from '@vue/test-utils'

import { Core } from '@/core'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'

describe('DocumentTranslatedContent.vue', () => {
  const { i18n, localVue, store } = Core.init(createLocalVue()).useAll()
  const index = toLower('DocumentTranslatedContent')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper = null

  it('should show no translations', async () => {
    const id = 'document-without-translation'
    await letData(es).have(new IndexedDocument(id, index)
      .withContent('Premier')
      .withLanguage('FRENCH')
      .withNoContentTranslated())
      .commit()
    await store.dispatch('document/get', { id, index })
    const document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { i18n, localVue, store, propsData: { document } })

    await wrapper.vm.$refs.content.transformContent()

    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('should show no translations when the content is empty', async () => {
    const id = 'document-without-content'
    await letData(es).have(new IndexedDocument(id, index)
      .withContent('Premier')
      .withLanguage('FRENCH')
      .withContentTranslated('', 'FRENCH', 'ENGLISH'))
      .commit()
    await store.dispatch('document/get', { id, index })

    const document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { i18n, localVue, store, propsData: { document } })

    await wrapper.vm.$refs.content.transformContent()

    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })

  it('shouldn\'t show italian translation', async () => {
    const id = 'document-without-a-translation-in-italian'
    await letData(es).have(new IndexedDocument(id, index)
      .withContent('Premier')
      .withLanguage('FRENCH')
      .withContentTranslated('Primo', 'FRENCH', 'ITALIAN'))
      .commit()
    await store.dispatch('document/get', { id, index })
    const document = store.state.document.doc
    wrapper = mount(DocumentTranslatedContent, { i18n, localVue, store, propsData: { document } })

    await wrapper.vm.$refs.content.transformContent()

    expect(wrapper.find('.document-translated-content__original .document-content__body').text()).toBe('Premier')
  })
})
