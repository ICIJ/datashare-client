import { shallowMount, flushPromises } from '@vue/test-utils'
import { beforeEach } from 'vitest'
import { find } from 'lodash'

import CoreSetup from '~tests/unit/CoreSetup'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import EntityInContext from '@/components/Entity/EntityInContext'
import { useDocumentStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  const getDocumentSlice = vi.fn()
  // We only override the method to get a content slice
  return { apiInstance: { ...apiInstance, getDocumentSlice } }
})

describe('EntityInContext.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, documentStore, searchStore

  // A quick function to generate the default props for most tests
  const defaultPropsData = async function ({ mention = 'Lea', excerptLength = 180 } = {}) {
    const category = 'PERSON'
    const id = 'document'
    const content = 'Lorem Lea ipsum dolor Yassine sit amet'
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withContent(content)
          .withNer('Lea', 6, category)
          .withNer('Yassine', 22, category)
          .withNer('contact@icij.org', -1, category)
      )
      .commit()
    await documentStore.getDocument({ id, index })
    await documentStore.getContent()
    await documentStore.getFirstPageForNamedEntityInCategory({ category })
    // This API call is mocked as it's provided by Datashare
    api.getDocumentSlice.mockImplementation(async (index, id, offset, limit) => ({
      content: content.slice(offset, offset + limit),
      maxOffset: content.length,
      limit
    }))
    const entities = documentStore.namedEntitiesPaginatedByCategories
    const entity = find(entities[category][0].hits, { mention })
    return { entity, excerptLength, visiblePopover: true }
  }

  beforeEach(async () => {
    core = CoreSetup.init().useAll()
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
    await flushPromises()
    expect(wrapper.vm.highlightedExcerpt).toBe('Lorem <mark>Lea</mark> ipsum dolor Yassine sit amet')
  })

  it('should display the entity at the end of the text', async () => {
    const props = await defaultPropsData({ mention: 'Yassine' })
    const global = { plugins: core.plugins }
    const wrapper = shallowMount(EntityInContext, { props, global })
    await flushPromises()
    expect(wrapper.vm.highlightedExcerpt).toBe('Lorem Lea ipsum dolor <mark>Yassine</mark> sit amet')
  })
})
