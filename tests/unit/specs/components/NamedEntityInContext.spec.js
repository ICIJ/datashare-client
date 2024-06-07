import { shallowMount } from '@vue/test-utils'
import { beforeEach } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import NamedEntityInContext from '@/components/NamedEntityInContext'

describe('NamedEntityInContext.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  let core

  // A quick function to generate the default props for most tests
  const defaultPropsData = async function ({ namedEntityIndex = 0, extractLength = 16 } = {}) {
    const category = 'PERSON'
    const id = 'document'
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withContent('Lorem Lea ipsum dolor Yassine sit amet')
          .withNer('Lea', 6, category)
          .withNer('Yassine', 22, category)
          .withNer('contact@icij.org', -1, category)
      )
      .commit()
    const document = await core.store.dispatch('document/get', { id, index })
    await core.store.dispatch('document/getContent')
    await core.store.dispatch('document/getFirstPageForNamedEntityInCategory', { category })
    const namedEntities = core.store.state.document.namedEntitiesPaginatedByCategories
    const namedEntity = namedEntities[category][0].hits[namedEntityIndex]
    return { document, namedEntity, extractLength }
  }

  beforeEach(() => {
    core = CoreSetup.init(api).useAll()
    core.store.commit('search/index', index)
  })

  afterEach(() => core.store.commit('document/reset'))

  it('should be a Vue instance', async () => {
    const props = await defaultPropsData()
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const wrapper = shallowMount(NamedEntityInContext, { props, global })
    expect(wrapper).toBeTruthy()
  })

  it('should display the named entity at the beginning of the text', async () => {
    const props = await defaultPropsData()
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const wrapper = shallowMount(NamedEntityInContext, { props, global })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('Lorem Lea ipsum dolor...')
  })

  it('should display the named entity at the end of the text', async () => {
    const props = await defaultPropsData({ namedEntityIndex: 1 })
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const wrapper = shallowMount(NamedEntityInContext, { props, global })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...m dolor Yassine...')
  })

  it('should display the named entity at the end of the text with a larger chunk', async () => {
    const props = await defaultPropsData({ namedEntityIndex: 1, extractLength: 40 })
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const wrapper = shallowMount(NamedEntityInContext, { props, global })
    expect(wrapper.find('.named-entity-in-context__extract').text()).toBe('...rem Lea ipsum dolor Yassine sit amet')
  })

  it('should not display the extract if the named entity comes from the medata', async () => {
    const props = await defaultPropsData({ namedEntityIndex: 2 })
    const global = { plugins: core.plugins, renderStubDefaultSlot: true }
    const wrapper = shallowMount(NamedEntityInContext, { props, global })
    expect(wrapper.find('.named-entity-in-context__extract').exists()).toBeFalsy()
    expect(wrapper.find('.named-entity-in-context__meta').exists()).toBeTruthy()
  })
})
