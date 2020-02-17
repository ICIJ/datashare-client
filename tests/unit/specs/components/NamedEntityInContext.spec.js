import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import NamedEntityInContext from '@/components/NamedEntityInContext'

import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { Core } from '@/core'

const { localVue, store } = Core.init(createLocalVue()).useAll()

describe('NamedEntityInContext.vue', () => {
  const index = toLower('NamedEntityInContext')
  esConnectionHelper(index)

  const es = esConnectionHelper.es
  // A quick function to generate the default propsData for most tests
  const defaultPropsData = async function ({ namedEntityIndex = 0, extractLength = 16 } = {}) {
    const id = 'document'
    await letData(es).have(new IndexedDocument(id, index)
      .withContent('Lorem Lea ipsum dolor Yassine sit amet')
      .withNer('Lea', 6, 'PERSON')
      .withNer('Yassine', 22, 'PERSON')
      .withNer('contact@icij.org', -1, 'PERSON'))
      .commit()
    const document = await store.dispatch('document/get', { id, index })
    const namedEntities = await store.dispatch('document/getFirstPageForNamedEntityInCategory', 'PERSON')
    const namedEntity = namedEntities.hits[namedEntityIndex]
    return { document, namedEntity, extractLength }
  }

  beforeAll(() => store.commit('search/index', index))

  afterEach(() => store.commit('document/reset'))

  it('should be a Vue instance', async () => {
    const propsData = await defaultPropsData()
    const wrapper = shallowMount(NamedEntityInContext, { localVue, propsData })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('should display the named entity at the beginning of the text', async () => {
    const propsData = await defaultPropsData()
    const wrapper = shallowMount(NamedEntityInContext, { localVue, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('Lorem Lea ipsum dolor...')
  })

  it('should display the named entity at the end of the text', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 1 })
    const wrapper = shallowMount(NamedEntityInContext, { localVue, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...m dolor Yassine...')
  })

  it('should display the named entity at the end of the text with a larger chunk', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 1, extractLength: 40 })
    const wrapper = shallowMount(NamedEntityInContext, { localVue, propsData })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...rem Lea ipsum dolor Yassine sit amet')
  })

  it('should not display the extract if the named entity comes from the medata', async () => {
    const propsData = await defaultPropsData({ namedEntityIndex: 2 })
    const wrapper = shallowMount(NamedEntityInContext, { localVue, propsData, mocks: { $t: msg => msg } })
    expect(wrapper.find('.named-entity-in-context__extract').exists()).toBeFalsy()
    expect(wrapper.find('.named-entity-in-context__meta').exists()).toBeTruthy()
  })
})
