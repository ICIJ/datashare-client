import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import DocumentTabNamedEntities from '@/components/document/DocumentTabNamedEntities'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { App } from '@/main'

const { localVue, store, i18n } = App.init(createLocalVue()).useAll()

describe('DocumentTabNamedEntities', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  const index = process.env.VUE_APP_ES_INDEX

  beforeAll(() => {
    Murmur.config.set('manageDocuments', true)
  })

  beforeEach(() => store.commit('document/reset'))

  it('should display named entities in the dedicated tab', async () => {
    const id = 'document-ner-a'
    await letData(es).have(new IndexedDocument(id)
      .withPipeline('CORENLP')
      .withNer('mention_01', 0, 'PERSON')
      .withNer('mention_02', 0, 'ORGANIZATION')
      .withNer('mention_03', 0, 'LOCATION'))
      .commit()
    const document = await store.dispatch('document/get', { id, index })
    await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document }, sync: false })

    const pills = wrapper.findAll('b-badge-stub')
    expect(pills).toHaveLength(3)
    expect(pills.at(0).find('b-badge-stub > span').text()).toEqual('mention_01')
    expect(pills.at(0).classes()).toContain('border-category-person')
    expect(pills.at(1).find('b-badge-stub > span').text()).toEqual('mention_02')
    expect(pills.at(1).classes()).toContain('border-category-organization')
    expect(pills.at(2).find('b-badge-stub > span').text()).toEqual('mention_03')
    expect(pills.at(2).classes()).toContain('border-category-location')
  })

  it('should display a specific error message if no names finding task has been run on that document', async () => {
    const id = 'document-ner-b'
    await letData(es).have(new IndexedDocument(id)).commit()
    const document = await store.dispatch('document/get', { id, index })
    await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document }, sync: false })

    expect(wrapper.findAll('.document__named-entities--not--searched')).toHaveLength(1)
  })

  it('should display a specific error message if no named entities found after names finding task', async () => {
    const id = 'document-ner-c'
    await letData(es).have(new IndexedDocument(id).withPipeline('CORENLP')).commit()
    const document = await store.dispatch('document/get', { id, index })
    await store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
    const wrapper = shallowMount(DocumentTabNamedEntities, { localVue, i18n, store, propsData: { document }, sync: false })

    expect(wrapper.findAll('.document__named-entities--not--found')).toHaveLength(1)
  })
})
