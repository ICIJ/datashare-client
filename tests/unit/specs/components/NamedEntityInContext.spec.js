import uniqueId from 'lodash/uniqueId'
import { createLocalVue, mount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import NamedEntityInContext from '@/components/NamedEntityInContext'

import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { App } from '@/main'

const { store, localVue, i18n } = App.init(createLocalVue()).useAll()

describe('NamedEntityInContext', () => {
  esConnectionHelper()

  const es = esConnectionHelper.es
  // A quick function to generate the default propsData for most tests
  const defaultPropsData = async function ({ namedEntityIndex = 0, extractLength = 16 } = {}) {
    const id = uniqueId('document-id-')
    await letData(es).have(new IndexedDocument(id)
      .withContent('Lorem Lea ipsum dolor Yassine sit amet')
      .withNer('Lea', 6, 'PERSON')
      .withNer('Yassine', 22, 'PERSON')
      .withNer('contact@icij.org', -1, 'PERSON'))
      .commit()
    const document = await store.dispatch('document/get', { id, index: process.env.VUE_APP_ES_INDEX })
    const namedEntities = await store.dispatch('document/getFirstPageForNamedEntityInCategory', 'PERSON')
    const namedEntity = namedEntities.hits[namedEntityIndex]
    return { document, namedEntity, extractLength }
  }

  // Activate the current index
  beforeAll(() => store.commit('search/index', process.env.VUE_APP_ES_INDEX))
  // Reset the document
  afterEach(() => store.commit('document/reset'))

  it('should be a Vue instance', async () => {
    const propsData = await defaultPropsData()
    const wrapper = mount(NamedEntityInContext, { localVue, i18n, propsData })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display the named entity at the beginning of the text', async () => {
    const propsData = await defaultPropsData()
    const wrapper = mount(NamedEntityInContext, { localVue, i18n, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('Lorem Lea ipsum dolor...')
  })

  it('should display the named entity at the end of the text', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 1 })
    const wrapper = mount(NamedEntityInContext, { localVue, i18n, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...m dolor Yassine...')
  })

  it('should display the named entity at the end of the text with a larger chunk', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 1, extractLength: 40 })
    const wrapper = mount(NamedEntityInContext, { localVue, i18n, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...rem Lea ipsum dolor Yassine sit amet')
  })

  it('should not display the extract if the named entity comes from the medata', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 2 })
    const wrapper = mount(NamedEntityInContext, { localVue, i18n, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').exists()).toBeFalsy()
    expect(wrapper.find('.named-entity-in-context__meta').exists()).toBeTruthy()
  })
})
