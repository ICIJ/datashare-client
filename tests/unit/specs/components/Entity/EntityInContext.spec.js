import { shallowMount } from '@vue/test-utils'
import { beforeEach } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import EntityInContext from '@/components/Entity/EntityInContext'

describe('EntityInContext.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  let core

  // A quick function to generate the default props for most tests
  const defaultPropsData = async function ({ mention = 'Lea', excerptLength = 16 } = {}) {
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
    const entities = core.store.state.document.namedEntitiesPaginatedByCategories
    const entity = entities[category][0].hits.find((e) => e.mention === mention)
    return { document, entity, excerptLength }
  }

  beforeEach(() => {
    core = CoreSetup.init(api).useAll()
    core.store.commit('search/index', index)
  })

  afterEach(() => core.store.commit('document/reset'))

  it('should be a Vue instance', async () => {
    const props = await defaultPropsData()
    const global = { plugins: core.plugins }
    const wrapper = shallowMount(EntityInContext, { props, global })
    expect(wrapper).toBeTruthy()
  })

  it('should display the entity at the beginning of the text', async () => {
    const props = await defaultPropsData({ mention: 'Lea' })
    const global = { plugins: core.plugins }
    const wrapper = shallowMount(EntityInContext, { props, global })
    expect(wrapper.vm.excerpt).toBe('Lorem Lea ipsum dolor...')
  })

  it('should display the entity at the end of the text', async () => {
    const props = await defaultPropsData({ mention: 'Yassine' })
    const global = { plugins: core.plugins }
    const wrapper = shallowMount(EntityInContext, { props, global })
    expect(wrapper.vm.excerpt).toBe('...m dolor Yassine...')
  })
})
