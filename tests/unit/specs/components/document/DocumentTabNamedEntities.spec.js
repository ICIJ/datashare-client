import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import DocumentTabNamedEntities from '@/components/document/DocumentTabNamedEntities'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import store from '@/store'
import { EventBus } from '@/utils/event-bus'
import Murmur from '@icij/murmur'
import BootstrapVue from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages }, silentTranslationWarn: true })

describe('DocumentTabNamedEntities.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es

  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))

  afterEach(() => store.commit('document/reset'))

  it('should display named entities in the dedicated tab', async () => {
    const document = 'doc_01.txt'
    await letData(es).have(new IndexedDocument(document)
      .withPipeline('CORENLP')
      .withNer('mention_01', 0, 'CATEGORY_01')
      .withNer('mention_02', 0, 'CATEGORY_02')
      .withNer('mention_03', 0, 'CATEGORY_03'))
      .commit()
    await store.dispatch('document/get', { id: document }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    const pills = wrapper.findAll('.badge-pill')
    expect(pills).toHaveLength(3)
    expect(pills.at(0).find('.badge-pill > span').text()).toEqual('mention_01')
    expect(pills.at(0).classes()).toContain('border-category-category_01')
    expect(pills.at(1).find('.badge-pill > span').text()).toEqual('mention_02')
    expect(pills.at(1).classes()).toContain('border-category-category_02')
    expect(pills.at(2).find('.badge-pill > span').text()).toEqual('mention_03')
    expect(pills.at(2).classes()).toContain('border-category-category_03')
  })

  it('should display a specific error message if no names finding task has been run on that document', async () => {
    const document = 'doc_01.txt'
    await letData(es).have(new IndexedDocument(document)).commit()
    await store.dispatch('document/get', { id: document }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.findAll('.document__named-entities--not--searched')).toHaveLength(1)
  })

  it('should display a specific error message if no named entities found after names finding task', async () => {
    const document = 'doc_01.txt'
    await letData(es).have(new IndexedDocument(document).withPipeline('CORENLP')).commit()
    await store.dispatch('document/get', { id: document }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.findAll('.document__named-entities--not--found')).toHaveLength(1)
  })

  it('should refresh the named entities search on custom event emitted', async () => {
    const document = 'doc_01.txt'
    let indexBuilder = await letData(es).have(new IndexedDocument(document)
      .withPipeline('CORENLP')
      .withNer('mention_01', 1, 'CATEGORY_01')
      .withNer('mention_02', 1, 'CATEGORY_02'))
      .commit()
    await store.dispatch('document/get', { id: document }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.findAll('.badge-pill')).toHaveLength(2)

    await indexBuilder.hideNer('mention_02')
    EventBus.$emit('facet::hide::named-entities')
    await delay(100)
    expect(wrapper.findAll('.badge-pill')).toHaveLength(1)
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
