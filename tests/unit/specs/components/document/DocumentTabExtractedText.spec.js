import DocumentTabExtractedText from '@/components/document/DocumentTabExtractedText'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import Murmur from '@icij/murmur'
import store from '@/store'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.use(VueI18n)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('DocumentTabExtractedText.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

  beforeAll(() => {
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => {
    store.commit('document/reset')
    store.commit('search/reset')
  })

  it('should mark named entities in the extracted text tab', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('content')
      .withNer('ner_01', 2, 'category_01')
      .withNer('ner_02', 17, 'category_02'))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('mark')).toHaveLength(2)
    expect(wrapper.findAll('mark').at(0).text()).toEqual('ner_01')
    expect(wrapper.findAll('mark').at(0).classes()).toContain('bg-category-category_01')
    expect(wrapper.findAll('mark').at(1).text()).toEqual('ner_02')
    expect(wrapper.findAll('mark').at(1).classes()).toContain('bg-category-category_02')
  })

  it('should display a document with named entities and escaped HTML', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('content')
      .withNer('ner', 2))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('mark')).toHaveLength(1)
  })

  it('should contain a "See highlights" toggle', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('content')
      .withNer('ner', 2))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('.document__header__see-highlights')).toHaveLength(1)
  })

  it('should not contain a "See highlights" toggle if there is no named entities', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('content'))
      .commit()
    await store.dispatch('document/get', { id })
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('.document__header__see-highlights')).toHaveLength(0)
  })

  it('should change the document state of showNamedEntities', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('content')
      .withNer('ner', 2))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.vm.showNamedEntities).toBeTruthy()

    wrapper.findAll('.document__header__see-highlights').at(0).trigger('click')

    expect(wrapper.vm.showNamedEntities).toBeFalsy()
  })

  it('should display a document without named entities', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('content')
      .withNer('ner', 2))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    store.commit('document/toggleShowNamedEntities')
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('mark')).toHaveLength(0)
  })

  it('should display query terms with occurrences in decreasing order', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('document result test document test test '))
      .commit()
    await store.dispatch('document/get', { id })
    store.commit('search/query', 'result test document')
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('ul')).toHaveLength(1)
    expect(wrapper.findAll('ul li')).toHaveLength(3)
    expect(wrapper.findAll('ul li').at(0).text()).toEqual('test (3)')
    expect(wrapper.findAll('ul li').at(1).text()).toEqual('document (2)')
    expect(wrapper.findAll('ul li').at(2).text()).toEqual('result (1)')
  })

  it('should not display the query terms on a specific field but content', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('term_01'))
      .commit()
    await store.dispatch('document/get', { id })
    store.commit('search/query', 'content:term_01 field_name:term_02')
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('ul')).toHaveLength(1)
    expect(wrapper.findAll('ul li')).toHaveLength(1)
    expect(wrapper.findAll('ul li').at(0).text()).toEqual('term_01 (1)')
  })

  it('should highlight the query terms', async () => {
    const id = 'doc'
    await letData(es).have(new IndexedDocument(id)
      .withContent('this is the full content'))
      .commit()
    await store.dispatch('document/get', { id })
    await store.dispatch('search/query', 'content full')
    store.commit('document/toggleShowNamedEntities')
    const wrapper = shallowMount(DocumentTabExtractedText, {
      localVue,
      store,
      i18n,
      propsData: {
        document: store.state.document.doc,
        namedEntities: store.state.document.namedEntities
      }
    })

    expect(wrapper.findAll('mark')).toHaveLength(2)
    expect(wrapper.findAll('mark.yellow-0')).toHaveLength(1)
    expect(wrapper.findAll('mark.yellow-1')).toHaveLength(1)
  })
})
