import { shallowMount } from '@vue/test-utils'
import { beforeEach } from 'vitest'

import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import EntityInContext from '@/components/Entity/EntityInContext'
import { useDocumentStore, useSearchStore } from '@/store/modules'

describe('EntityInContext.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  let core, documentStore, searchStore

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
    const document = await documentStore.getDocument({ id, index })
    await documentStore.getContent()
    await documentStore.getFirstPageForNamedEntityInCategory({ category })
    const entities = documentStore.namedEntitiesPaginatedByCategories
    const entity = entities[category][0].hits.find((e) => e.mention === mention)
    return { document, entity, excerptLength }
  }

  beforeEach(() => {
    core = CoreSetup.init(api).useAll()
    searchStore = useSearchStore()
    searchStore.setIndex(index)
    documentStore = useDocumentStore()
  })

  afterEach(() => documentStore.reset())

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
