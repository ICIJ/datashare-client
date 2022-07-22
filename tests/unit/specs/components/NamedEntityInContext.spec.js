import { createLocalVue, shallowMount } from '@vue/test-utils'

import NamedEntityInContext from '@/components/NamedEntityInContext'
import { Core } from '@/core'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()

describe('NamedEntityInContext.vue', () => {
  const { index, es } = esConnectionHelper.build()

  // A quick function to generate the default propsData for most tests
  const defaultPropsData = async function ({ namedEntityIndex = 0, extractLength = 16 } = {}) {
    const category = 'PERSON'
    const id = 'document'
    await letData(es).have(new IndexedDocument(id, index)
      .withContent('Lorem Lea ipsum dolor Yassine sit amet')
      .withNer('Lea', 6, category)
      .withNer('Yassine', 22, category)
      .withNer('contact@icij.org', -1, category))
      .commit()
    const document = await store.dispatch('document/get', { id, index })
    await store.dispatch('document/getContent')
    await store.dispatch('document/getFirstPageForNamedEntityInCategory', { category })
    const namedEntities = store.state.document.namedEntitiesPaginatedByCategories
    const namedEntity = namedEntities[category][0].hits[namedEntityIndex]
    return { document, namedEntity, extractLength }
  }

  beforeAll(() => store.commit('search/index', index))

  afterEach(() => store.commit('document/reset'))

  it('should be a Vue instance', async () => {
    const propsData = await defaultPropsData()
    const wrapper = shallowMount(NamedEntityInContext, { i18n, localVue, propsData, store, wait })
    expect(wrapper).toBeTruthy()
  })

  it('should display the named entity at the beginning of the text', async () => {
    const propsData = await defaultPropsData()
    const wrapper = shallowMount(NamedEntityInContext, { i18n, localVue, propsData, store, wait })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('Lorem Lea ipsum dolor...')
  })

  it('should display the named entity at the end of the text', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 1 })
    const wrapper = shallowMount(NamedEntityInContext, { i18n, localVue, propsData, store, wait })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...m dolor Yassine...')
  })

  it('should display the named entity at the end of the text with a larger chunk', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 1, extractLength: 40 })
    const wrapper = shallowMount(NamedEntityInContext, { i18n, localVue, propsData, store, wait })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...rem Lea ipsum dolor Yassine sit amet')
  })

  it('should not display the extract if the named entity comes from the medata', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 2 })
    const wrapper = shallowMount(NamedEntityInContext, { i18n, localVue, propsData, store, wait })
    expect(wrapper.find('.named-entity-in-context__extract').exists()).toBeFalsy()
    expect(wrapper.find('.named-entity-in-context__meta').exists()).toBeTruthy()
  })
})
