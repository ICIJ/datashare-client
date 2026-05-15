import { flushPromises, shallowMount, mount } from '@vue/test-utils'
import { uniqueId } from 'lodash'

import RawDocBuilder from '~tests/unit/RawDocBuilder'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewTabsEntities from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities'
import EntitySection from '@/components/Entity/EntitySection/EntitySection'
import EntityButton from '@/components/Entity/EntityButton'
import { useDocumentStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'
import { IndexedDocument, letData } from '~tests/unit/es_utils.js'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper.js'

vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal()
  return {
    ...actual,
    throttle: cb => cb
  }
})

describe('DocumentViewTabsEntities.vue', () => {
  const { es } = esConnectionHelper.build()
  const index = 'test-index'
  const routes = [
    { name: 'document', path: '/' },
    { name: 'task.entities.new', path: '/task/entities/new' }
  ]
  let core, documentStore, id, wrapper, spy

  function nerHit(mention, category, routing = id) {
    return {
      _index: index,
      _type: '_doc',
      _id: mention + '-' + category,
      _score: 1,
      _routing: routing,
      _source: {
        extractorLanguage: 'ENGLISH',
        mentionNorm: mention.toLowerCase(),
        mention,
        offsets: [0],
        category,
        type: 'NamedEntity',
        join: { parent: routing, name: 'NamedEntity' },
        isHidden: false
      }
    }
  }

  function nerResponse(hits = []) {
    return { hits: { total: { value: hits.length, relation: 'eq' }, max_score: 1, hits } }
  }

  beforeAll(() => {
    core = CoreSetup.init().useAll().useRouter(routes)
    core.config.set('manageDocuments', true)
  })

  beforeEach(() => {
    id = uniqueId('document-')
    core.createPinia()
    spy = vi.spyOn(api.elasticsearch, 'getDocumentNamedEntitiesInCategory')
    spy.mockResolvedValue(nerResponse())
    documentStore = useDocumentStore()
  })

  afterEach(async () => {
    await flushPromises()
    wrapper.unmount()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it.skip('should display filtered named entities', async () => {
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withPipeline('DUCKNLP')
          .withNer('riri', 0, 'PERSON')
          .withNer('fifi', 0, 'PERSON')
          .withNer('loulou', 0, 'PERSON')
      )
      .commit()

    await documentStore.getDocument({ id, index })
    await documentStore.getFirstPageForNamedEntityInAllCategories()

    wrapper = mount(DocumentViewTabsEntities, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true }
    })

    expect(wrapper.findAllComponents(EntityButton)).toHaveLength(3)
    await documentStore.getFirstPageForNamedEntityInAllCategories({ filterToken: 'lou' })
    await flushPromises()
    const people = wrapper.findAllComponents(EntityButton)
    expect(people).toHaveLength(1)
  })

  it('should display named entities in the dedicated tab', async () => {
    spy.mockImplementation((_idx, _docId, _routing, _from, _size, category) => {
      const byCategory = {
        PERSON: [nerHit('mention_01', 'PERSON')],
        ORGANIZATION: [nerHit('mention_02', 'ORGANIZATION')],
        LOCATION: [nerHit('mention_03', 'LOCATION')],
        EMAIL: []
      }
      return Promise.resolve(nerResponse(byCategory[category] ?? []))
    })

    documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
    await documentStore.getFirstPageForNamedEntityInAllCategories()

    wrapper = mount(DocumentViewTabsEntities, {
      global: { plugins: core.plugins }
    })

    const categories = wrapper.findAllComponents(EntitySection)
    expect(categories).toHaveLength(3)
    expect(categories.at(0).text()).toContain('People')
    expect(categories.at(0).text()).toContain('mention_01')
    expect(categories.at(1).text()).toContain('Organizations')
    expect(categories.at(1).text()).toContain('mention_02')
    expect(categories.at(2).text()).toContain('Locations')
    expect(categories.at(2).text()).toContain('mention_03')
  })

  it('should contains a specific text when no NER task has been run on that document', async () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).toRaw())
    await documentStore.getFirstPageForNamedEntityInAllCategories()

    wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins
      }
    })

    expect(wrapper.find('.document-view-tabs-entities__not-searched').exists()).toBe(true)
    expect(wrapper.find('.document-view-tabs-entities__not-searched').attributes('keypath')).toBe(
      'document.namedEntitiesNotSearched'
    )
  })

  it('should display an error message if no named entities has been found after names finding task', async () => {
    documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
    await documentStore.getFirstPageForNamedEntityInAllCategories()

    wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins
      }
    })

    expect(wrapper.find('.document-view-tabs-entities__not-found').exists()).toBe(true)
    expect(wrapper.find('.document-view-tabs-entities__not-found').attributes('keypath')).toBe(
      'document.namedEntitiesNotFound'
    )
  })

  describe('with mocking the API', () => {
    beforeEach(() => {
      spy.mockResolvedValue({
        hits: {
          total: {
            value: 1,
            relation: 'eq'
          },
          max_score: 2.0062606,
          hits: [
            {
              _index: index,
              _type: '_doc',
              _id: '8c8b44e6522c2e3f35f33dd28bafa1c82b78464e32f6d41b5a7725e90fe084f3e9dd2c7273dbb780191c89da2d9f810f',
              _score: 2.0062606,
              _routing: id,
              _source: {
                extractorLanguage: 'ENGLISH',
                mentionNormTextLength: 6,
                metadata: null,
                mentionNorm: 'london',
                offsets: [0, 10],
                extractor: 'CORENLP',
                partsOfSpeech: null,
                join: {
                  parent: id,
                  name: 'NamedEntity'
                },
                category: 'LOCATION',
                type: 'NamedEntity',
                mention: 'London',
                isHidden: false
              }
            }
          ]
        }
      })
    })

    it('should call the api to get named entities', async () => {
      documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
      await documentStore.getFirstPageForNamedEntityInAllCategories()

      spy.mockClear()

      wrapper = shallowMount(DocumentViewTabsEntities, {
        global: { plugins: core.plugins, renderStubDefaultSlot: true }
      })

      await flushPromises()

      const categories = wrapper.findAllComponents(EntitySection)
      expect(spy).toBeCalledTimes(4)
      expect(categories).toHaveLength(4)
      expect(categories.at(0).attributes('count')).toBe('1')
    })

    it('should call the api to get filtered named entities', async () => {
      documentStore.setDocument(RawDocBuilder.build(id, index).withPipeline('CORENLP').toRaw())
      await documentStore.getFirstPageForNamedEntityInAllCategories()

      spy.mockClear()

      wrapper = mount(DocumentViewTabsEntities, {
        global: { plugins: core.plugins, renderStubDefaultSlot: true, stubs: { EntitySection: true } }
      })

      expect(spy).toBeCalledTimes(4)
      await wrapper.find('input').setValue('lou')
      expect(spy).toBeCalledTimes(8)
      expect(spy).toBeCalledWith(index, id, id, 0, 50, 'PERSON', 'lou')
      expect(spy).toBeCalledWith(index, id, id, 0, 50, 'EMAIL', 'lou')
    })
  })
})
