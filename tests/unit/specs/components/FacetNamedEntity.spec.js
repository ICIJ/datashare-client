import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import messages from '@/lang/en'
import store from '@/store'
import mixin from '@/mixins/facets'
import { createLocalVue, mount } from '@vue/test-utils'
import { EventBus } from '@/utils/event-bus'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import noop from 'lodash/noop'
import find from 'lodash/find'

jest.mock('@/api/DatashareClient', () => {
  return jest.fn().mockImplementation(() => {
    return { deleteNamedEntitiesByMentionNorm: jest.fn().mockImplementation(() => {
      return Promise.resolve()
    }) }
  })
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.use(VueI18n)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetNamedEntity.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => {
    mixin.methods.watchedForUpdate = noop
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    wrapper = mount(FacetNamedEntity, { localVue, i18n, store, propsData: { facet: find(store.state.search.facets, { name: 'named-entity-person' }) } })
    store.commit('search/setGlobalSearch', false)
  })

  afterEach(() => store.commit('search/reset'))
  it('should display empty list', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(0)
  })

  it('should display 1 named entity', async () => {
    await letData(es).have(new IndexedDocument('docs/naz.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
    expect(wrapper.findAll('.facet__items__item__description').at(0).text()).toEqual('one occurrence in one doc')
  })

  it('should display 2 named entities in one document', async () => {
    await letData(es).have(new IndexedDocument('docs/qux.txt').withContent('this is a document').withNer('qux').withNer('foo')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(3)
  })

  it('should display 1 named entity in 2 documents', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER document contain 2 NER').withNer('NER', 2).withNer('NER', 25)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('another document with NER').withNer('NER', 22)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
    expect(wrapper.findAll('.facet__items__item__description').at(0).text()).toEqual('3 occurrences in 2 docs')
  })

  it('should display 3 named entities in 2 documents in correct order', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER2 doc with NER2 NER2 NER1 and NER3')
      .withNer('NER2', 2).withNer('NER2', 16).withNer('NER2', 21).withNer('NER1', 26).withNer('NER3', 35)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(4)
    expect(wrapper.findAll('.facet__items__item__body__key').at(0).text()).toEqual('NER1')
    expect(wrapper.findAll('.facet__items__item__body__key').at(1).text()).toEqual('NER2')
    expect(wrapper.findAll('.facet__items__item__body__key').at(2).text()).toEqual('NER3')
  })

  it('should not display the "Show more" button', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER2 doc with NER2 NER2 NER1 and NER3')
      .withNer('NER2', 2).withNer('NER2', 16).withNer('NER2', 21).withNer('NER1', 26).withNer('NER3', 35)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display span').length).toEqual(0)
  })

  it('should display the "Show more" button (1/2)', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER2 doc with NER2 NER2 NER1 NER3 NER4 NER5 and NER6')
      .withNer('NER2', 2).withNer('NER2', 16).withNer('NER2', 21).withNer('NER1', 26).withNer('NER3', 35).withNer('NER4', 42).withNer('NER5', 42).withNer('NER6', 42)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display > span').length).toEqual(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
  })

  it('should display the "Show more" button (2/2)', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER2 doc with NER2 NER2 NER1 NER3 NER4 NER5 and NER6')
      .withNer('NER2', 2).withNer('NER2', 16).withNer('NER2', 21).withNer('NER1', 26).withNer('NER3', 35).withNer('NER4', 42).withNer('NER5', 42).withNer('NER6', 42)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display > span').length).toEqual(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
  })

  it('should filter on named entity facet and return no documents', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 1)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER1 document').withNer('NER2', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc3.txt').withContent('a NER1 document').withNer('NER3', 3)).commit()
    await letData(es).have(new IndexedDocument('docs/doc4.txt').withContent('a NER1 document').withNer('NER4', 4)).commit()
    wrapper.vm.root.facetQuery = 'Windows'

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(0)
  })

  it('should filter on named entity facet and return all documents', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 1)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER1 document').withNer('NER2', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc3.txt').withContent('a NER1 document').withNer('NER3', 3)).commit()
    await letData(es).have(new IndexedDocument('docs/doc4.txt').withContent('a NER1 document').withNer('NER4', 4)).commit()
    wrapper.vm.root.facetQuery = 'ner'

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(5)
  })

  it('should filter on named entity facet and return only 1 document', async () => {
    await letData(es).have(new IndexedDocument('docs/doc1.txt').withContent('a NER1 document').withNer('NER1', 1)).commit()
    await letData(es).have(new IndexedDocument('docs/doc2.txt').withContent('a NER1 document').withNer('NER2', 2)).commit()
    await letData(es).have(new IndexedDocument('docs/doc3.txt').withContent('a NER1 document').withNer('NER3', 3)).commit()
    await letData(es).have(new IndexedDocument('docs/doc4.txt').withContent('a NER1 document').withNer('NER4', 4)).commit()
    wrapper.vm.root.facetQuery = 'ner1'

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
  })

  it('should display the dropdown menu', async () => {
    await letData(es).have(new IndexedDocument('docs/naz.txt').withContent('this is a naz document').withNer('naz')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .facet__items__item__menu').length).toEqual(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__menu .dropdown-item').length).toEqual(1)
  })

  it('should emit a facet::hide::named-entities event on click to delete named entity', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapper.vm.root.aggregate()

    const mockCallback = jest.fn()
    EventBus.$on('facet::hide::named-entities', mockCallback)

    await wrapper.find('.facet__items__item .facet__items__item__menu .dropdown-item:first-child').trigger('click')

    expect(mockCallback.mock.calls.length).toEqual(1)
  })

  it('should call the aggregate function after a named entity deletion', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapper.vm.root.aggregate()

    const spyAggregate = jest.spyOn(wrapper.vm.root, 'aggregate')
    expect(spyAggregate).not.toBeCalled()

    await wrapper.find('.facet__items__item .facet__items__item__menu .dropdown-item:first-child').trigger('click')

    expect(spyAggregate).toBeCalled()
    expect(spyAggregate).toBeCalledTimes(1)
  })

  it('should filter results according to the content type facet search', async () => {
    await letData(es).have(new IndexedDocument('index_01.pdf').withContent('PDF content').withContentType('application/pdf').withNer('pdf')).commit()
    await letData(es).have(new IndexedDocument('index_02.csv').withContent('CSV content').withContentType('text/csv').withNer('csv')).commit()

    let contentTypeFacet = find(store.state.search.facets, { name: 'content-type' })
    contentTypeFacet.value = ['application/pdf']
    store.commit('search/addFacetValue', contentTypeFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
  })

  it('should filter results according to the path facet search', async () => {
    await letData(es).have(new IndexedDocument('/a/index_01.pdf').withContent('PDF content').withNer('pdf')).commit()
    await letData(es).have(new IndexedDocument('/b/index_02.csv').withContent('CSV content').withNer('csv')).commit()

    let pathFacet = find(store.state.search.facets, { name: 'path' })
    pathFacet.value = ['/a']
    store.commit('search/addFacetValue', pathFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
  })

  it('should filter results according to the date facet search', async () => {
    await letData(es).have(new IndexedDocument('index_01.pdf').withContent('PDF content').withNer('pdf').withIndexingDate('2018-10-19T10:11:12.001Z')).commit()
    await letData(es).have(new IndexedDocument('index_02.csv').withContent('CSV content').withNer('csv').withIndexingDate('2018-09-19T10:11:12.001Z')).commit()

    let dateFacet = find(store.state.search.facets, { name: 'indexing-date' })
    dateFacet.value = [new Date('2018-09-01T00:00:00.000Z').getTime().toString()]
    store.commit('search/addFacetValue', dateFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
  })

  it('should filter results according to the content type reverse facet search', async () => {
    await letData(es).have(new IndexedDocument('index_01.pdf').withContent('PDF content').withContentType('application/pdf').withNer('pdf')).commit()
    await letData(es).have(new IndexedDocument('index_02.csv').withContent('CSV content').withContentType('text/csv').withNer('csv')).commit()

    let contentTypeFacet = find(store.state.search.facets, { name: 'content-type' })
    contentTypeFacet.value = ['application/pdf']
    store.commit('search/addFacetValue', contentTypeFacet)
    store.commit('search/toggleFacet', 'content-type')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
    expect(wrapper.findAll('.facet__items__item__body__key').at(0).text()).toContain('csv')
  })

  it('should display the named entities containing the query string, and those linked to documents containing the query string', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('Document 01 with tax').withNer('NER')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('Document 02').withNer('tax')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('Document 03 without anything').withNer('useless')).commit()

    store.commit('search/query', 'tax')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(3)
    expect(wrapper.findAll('.facet__items__item__body__key').at(0).text()).toContain('NER')
    expect(wrapper.findAll('.facet__items__item__body__key').at(1).text()).toContain('tax')
  })

  it('should filter results according to the named entity facet search', async () => {
    await letData(es).have(new IndexedDocument('doc_01.pdf').withContent('PDF content').withNer('pdf')).commit()
    await letData(es).have(new IndexedDocument('doc_02.csv').withContent('CSV content').withNer('csv')).commit()
    await letData(es).have(new IndexedDocument('doc_03.csv').withContent('TXT content').withNer('txt')).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['pdf']
    store.commit('search/addFacetValue', namedEntityFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
    expect(wrapper.findAll('.facet__items__item').at(1).text()).toContain('pdf')
  })

  it('should display the only named-entity-person selected', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('1st document')
      .withNer('person_01', 1, 'PERSON')
      .withNer('person_02', 1, 'PERSON')
      .withNer('person_03', 1, 'PERSON')
      .withNer('organization_01', 1, 'ORGANIZATION')
      .withNer('organization_02', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('2d document')
      .withNer('person_03', 1, 'PERSON')
      .withNer('organization_03', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('3rd document')
      .withNer('person_02', 1, 'PERSON')
      .withNer('person_04', 1, 'PERSON')
      .withNer('organization_02', 1, 'ORGANIZATION')
      .withNer('organization_03', 1, 'ORGANIZATION')
      .withNer('organization_04', 1, 'ORGANIZATION')
    ).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_02']
    store.commit('search/addFacetValue', namedEntityFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
    expect(wrapper.findAll('.facet__items__item').at(1).text()).toContain('person_02')
  })

  it('should filter results of named-entity-person according to the named-entity-organization selected', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('1st document')
      .withNer('person_01', 1, 'PERSON')
      .withNer('person_02', 1, 'PERSON')
      .withNer('person_03', 1, 'PERSON')
      .withNer('organization_01', 1, 'ORGANIZATION')
      .withNer('organization_02', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('2d document')
      .withNer('person_03', 1, 'PERSON')
      .withNer('organization_03', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('3rd document')
      .withNer('person_02', 1, 'PERSON')
      .withNer('person_04', 1, 'PERSON')
      .withNer('organization_02', 1, 'ORGANIZATION')
      .withNer('organization_03', 1, 'ORGANIZATION')
      .withNer('organization_04', 1, 'ORGANIZATION')
    ).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-organization' })
    namedEntityFacet.value = ['organization_03']
    store.commit('search/addFacetValue', namedEntityFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(4)
    expect(wrapper.findAll('.facet__items__item').at(1).text()).toContain('person_02')
    expect(wrapper.findAll('.facet__items__item').at(2).text()).toContain('person_03')
    expect(wrapper.findAll('.facet__items__item').at(3).text()).toContain('person_04')
  })

  it('should prepend a selected and inverted Named Entity in the results, and remove it from the rest of the results', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('document').withNer('person_01')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('document').withNer('person_02')).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    store.commit('search/toggleFacet', 'named-entity-person')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(3)
    expect(wrapper.findAll('.facet__items__item').at(1).text()).toContain('person_01')
    expect(wrapper.findAll('.facet__items__item').at(1).classes()).toContain('facet__items__item--active')
    expect(wrapper.findAll('.facet__items__item').at(2).text()).toContain('person_02')
    expect(wrapper.findAll('.facet__items__item').at(2).classes()).not.toContain('facet__items__item--active')
  })

  it('should filter facets results on 2 named entities from different categories', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('content')
      .withNer('person_01', 1, 'PERSON')
      .withNer('person_02', 1, 'PERSON')
      .withNer('organization_01', 1, 'ORGANIZATION')
      .withNer('organization_02', 1, 'ORGANIZATION')
      .withNer('location_01', 1, 'LOCATION')
      .withNer('location_02', 1, 'LOCATION')
    ).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-person' })
    namedEntityFacet.value = ['person_01']
    store.commit('search/addFacetValue', namedEntityFacet)

    namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-organization' })
    namedEntityFacet.value = ['organization_01']
    store.commit('search/addFacetValue', namedEntityFacet)

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
  })

  it('should display the correct number of occurences if named entity facet is inverted', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('content')
      .withNer('person_01', 1, 'PERSON')
      .withNer('organization_01', 1, 'ORGANIZATION')
    ).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('content')
      .withNer('person_01', 1, 'PERSON')
      .withNer('organization_02', 1, 'ORGANIZATION')
    ).commit()

    let namedEntityFacet = find(store.state.search.facets, { name: 'named-entity-organization' })
    namedEntityFacet.value = ['organization_01']
    store.commit('search/addFacetValue', namedEntityFacet)
    store.commit('search/toggleFacet', 'named-entity-organization')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item').length).toEqual(2)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__description').at(0).text()).toContain('one occurrence in one doc')
  })
})
