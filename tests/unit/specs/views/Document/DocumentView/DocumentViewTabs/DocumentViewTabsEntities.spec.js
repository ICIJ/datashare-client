import { shallowMount, mount, flushPromises } from '@vue/test-utils'
import { uniqueId } from 'lodash'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewTabsEntities from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities'
import EntitySection from '@/components/Entity/EntitySection/EntitySection'
import EntityButton from '@/components/Entity/EntityButton'
vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal()
  return {
    ...actual,
    throttle: (cb) => cb
  }
})
describe('DocumentViewTabsEntities.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = uniqueId('document-')
  const api = { elasticsearch: es }
  let core, wrapper

  beforeEach(() => {
    const routes = [
      { name: 'document.text', path: '/text' },
      { name: 'document', path: '/' },
      { name: 'task.entities.new', path: '/task/entities/new' }
    ]
    core = CoreSetup.init(api).useAll().useRouter(routes)
    core.config.set('manageDocuments', true)
    core.store.commit('document/reset')
  })
  afterEach(() => {
    wrapper.unmount()
  })

  it('should display filtered named entities', async () => {
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withPipeline('DUCKNLP')
          .withNer('riri', 0, 'PERSON')
          .withNer('fifi', 0, 'PERSON')
          .withNer('loulou', 0, 'PERSON')
      )
      .commit()

    const document = await core.store.dispatch('document/get', { id, index })

    await core.store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
    wrapper = mount(DocumentViewTabsEntities, {
      global: { plugins: core.plugins, renderStubDefaultSlot: true },
      props: { document }
    })

    expect(wrapper.findAllComponents(EntityButton)).toHaveLength(3)
    await wrapper.find('input').setValue('lou')
    // CD: I did not find another way :( ...
    await wrapper.vm.$nextTick()
    await flushPromises()
    await flushPromises()
    await flushPromises()
    await flushPromises()
    await flushPromises()
    await flushPromises()

    const persons = wrapper.findAllComponents(EntityButton)
    expect(persons).toHaveLength(1)
  })
  it('should display named entities in the dedicated tab', async () => {
    await letData(es)
      .have(
        new IndexedDocument(id, index)
          .withPipeline('CORENLP')
          .withNer('mention_01', 0, 'PERSON')
          .withNer('mention_02', 0, 'ORGANIZATION')
          .withNer('mention_03', 0, 'LOCATION')
      )
      .commit()

    const document = await core.store.dispatch('document/get', { id, index })
    await core.store.dispatch('document/getFirstPageForNamedEntityInAllCategories')
    wrapper = mount(DocumentViewTabsEntities, {
      global: { plugins: core.plugins },
      props: { document }
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
    await letData(es).have(new IndexedDocument(id, index)).commit()

    const document = await core.store.dispatch('document/get', { id, index })
    await core.store.dispatch('document/getFirstPageForNamedEntityInAllCategories')

    wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins
      },
      props: { document }
    })
    expect(wrapper.find('.document-view-tabs-entities__not-searched').exists()).toBe(true)
    expect(wrapper.find('.document-view-tabs-entities__not-searched').attributes('keypath')).toBe(
      'document.namedEntitiesNotSearched'
    )
  })

  it('should display an error message if no named entities has been found after names finding task', async () => {
    await letData(es).have(new IndexedDocument(id, index).withPipeline('CORENLP')).commit()

    const document = await core.store.dispatch('document/get', { id, index })
    await core.store.dispatch('document/getFirstPageForNamedEntityInAllCategories')

    wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins
      },
      props: { document }
    })

    expect(wrapper.find('.document-view-tabs-entities__not-found').exists()).toBe(true)
    expect(wrapper.find('.document-view-tabs-entities__not-found').attributes('keypath')).toBe(
      'document.namedEntitiesNotFound'
    )
  })
})
