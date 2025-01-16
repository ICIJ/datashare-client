import { shallowMount, mount } from '@vue/test-utils'
import { uniqueId } from 'lodash'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import DocumentViewTabsEntities from '@/views/Document/DocumentView/DocumentViewTabs/DocumentViewTabsEntities'
import FormControlSearch from "@/components/Form/FormControl/FormControlSearch";

describe('DocumentViewTabsEntities.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const id = uniqueId('document-')
  let core

  beforeEach(() => {
    const routes = [{ name: 'document.text' ,path:'/text'}, { path: '/', name: 'document' }]
    core = CoreSetup.init({ elasticsearch: es }).useAll().useRouter(routes)
    core.config.set('manageDocuments', true)
    core.store.commit('document/reset')
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
    const wrapper = mount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document }
    })

    const categories = wrapper.findAll('.document-view-tabs-entities__category')
    expect(categories.at(0).text()).toContain('People')
    expect(categories.at(0).text()).toContain('mention_01')
    expect(categories.at(1).text()).toContain('Organizations')
    expect(categories.at(1).text()).toContain('mention_02')
    expect(categories.at(2).text()).toContain('Locations')
    expect(categories.at(2).text()).toContain('mention_03')
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
    const wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document }
    })

    wrapper.findComponent(FormControlSearch).trigger('update:modelValue','lou')
    //await wrapper.vm.getFirstPageInAllCategories()

    const pills = wrapper.findAll('b-badge-stub')
    expect(pills).toHaveLength(1)
    expect(pills.at(0).text()).toBe('loulou')
    expect(pills.at(0).classes()).toContain('border-category-person')
  })

  it('should display a specific error message if no names finding task has been run on that document', async () => {
    await letData(es).have(new IndexedDocument(id, index)).commit()

    const document = await core.store.dispatch('document/get', { id, index })
    await core.store.dispatch('document/getFirstPageForNamedEntityInAllCategories')

    const wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document }
    })

    expect(wrapper.findAll('.document__named-entities--not--searched')).toHaveLength(1)
  })

  it('should display a specific error message if no named entities found after names finding task', async () => {
    await letData(es).have(new IndexedDocument(id, index).withPipeline('CORENLP')).commit()

    const document = await core.store.dispatch('document/get', { id, index })
    await core.store.dispatch('document/getFirstPageForNamedEntityInAllCategories')

    const wrapper = shallowMount(DocumentViewTabsEntities, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      },
      props: { document }
    })

    expect(wrapper.findAll('.document__named-entities--not--found')).toHaveLength(1)
  })
})
