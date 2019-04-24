import DocumentTabExtractedText from '@/components/document/DocumentTabExtractedText'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Murmur from '@icij/murmur'
import store from '@/store'

const localVue = createLocalVue()
localVue.use(Murmur)

describe('DocumentTabExtractedText.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

  beforeAll(() => {
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => {
    store.commit('document/reset')
  })

  it('should mark named entities in the extracted text tab', async () => {
    const id = 'mydoc.txt'
    await letData(es).have(new IndexedDocument(id)
      .withContent('a NER doc with 2 NER2')
      .withNer('NER', 2, 'CATEGORY1')
      .withNer('NER2', 17, 'CATEGORY2'))
      .commit()
    await store.dispatch('document/get', { id: id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabExtractedText, { localVue, propsData: { document: store.state.document.doc, namedEntities: store.state.document.namedEntities } })

    expect(wrapper.findAll('mark')).toHaveLength(2)
    expect(wrapper.findAll('mark').at(0).text()).toEqual('NER')
    expect(wrapper.findAll('mark').at(0).classes()).toContain('bg-category-category1')
    expect(wrapper.findAll('mark').at(1).text()).toEqual('NER2')
    expect(wrapper.findAll('mark').at(1).classes()).toContain('bg-category-category2')
  })

  it('should display a document with named entities and escaped HTML', async () => {
    const id = 'html_doc.txt'
    await letData(es).have(new IndexedDocument(id)
      .withContent('a foo document <with>HTML</with>')
      .withNer('foo', 2))
      .commit()
    await store.dispatch('document/get', { id: id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabExtractedText, { localVue, propsData: { document: store.state.document.doc, namedEntities: store.state.document.namedEntities } })

    expect(wrapper.findAll('mark')).toHaveLength(1)
  })
})
