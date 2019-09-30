import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import DocumentTabNamedEntities from '@/components/document/DocumentTabNamedEntities'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import store from '@/store'
import Murmur from '@icij/murmur'
import BootstrapVue from 'bootstrap-vue'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages }, silentTranslationWarn: true })

describe('DocumentTabNamedEntities', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const id = 'document'

  beforeAll(() => {
    Murmur.config.set('manageDocuments', true)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => store.commit('document/reset'))

  it('should display named entities in the dedicated tab', async () => {
    await letData(es).have(new IndexedDocument(id)
      .withPipeline('CORENLP')
      .withNer('mention_01', 0, 'CATEGORY_01')
      .withNer('mention_02', 0, 'CATEGORY_02')
      .withNer('mention_03', 0, 'CATEGORY_03'))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    const pills = wrapper.findAll('b-badge-stub')
    expect(pills).toHaveLength(3)
    expect(pills.at(0).find('b-badge-stub > span').text()).toEqual('mention_01')
    expect(pills.at(0).classes()).toContain('border-category-category_01')
    expect(pills.at(1).find('b-badge-stub > span').text()).toEqual('mention_02')
    expect(pills.at(1).classes()).toContain('border-category-category_02')
    expect(pills.at(2).find('b-badge-stub > span').text()).toEqual('mention_03')
    expect(pills.at(2).classes()).toContain('border-category-category_03')
  })

  it('should display a specific error message if no names finding task has been run on that document', async () => {
    await letData(es).have(new IndexedDocument(id)).commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.findAll('.document__named-entities--not--searched')).toHaveLength(1)
  })

  it('should display a specific error message if no named entities found after names finding task', async () => {
    await letData(es).have(new IndexedDocument(id).withPipeline('CORENLP')).commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.findAll('.document__named-entities--not--found')).toHaveLength(1)
  })

  it('should refresh the named entities search on custom event emitted', async () => {
    let indexBuilder = await letData(es).have(new IndexedDocument(id)
      .withPipeline('CORENLP')
      .withNer('mention_01', 1, 'CATEGORY_01')
      .withNer('mention_02', 1, 'CATEGORY_02'))
      .commit()
    await store.dispatch('document/get', { id }).then(() => store.dispatch('document/getNamedEntities'))
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document: store.state.document.doc } })

    expect(wrapper.findAll('b-badge-stub')).toHaveLength(2)

    await indexBuilder.hideNer('mention_02')
    wrapper.vm.$root.$emit('facet::hide::named-entities')
    await delay(100)

    expect(wrapper.findAll('b-badge-stub')).toHaveLength(1)
  })
})

function delay (t, v) {
  return new Promise(function (resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
