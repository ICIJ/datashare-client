import { shallowMount } from '@vue/test-utils'
import Murmur from '@icij/murmur-next'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, IndexedDocument, letData } from '~tests/unit/es_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import SearchResultsList from '@/components/SearchResultsList'
import settings from '@/utils/settings'

describe('SearchResultsList.vue', () => {
  let wrapper

  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  const core = CoreSetup.init(api).useAll()

  async function createView(query = '*', from = 0, perPage = 25, field = settings.defaultSearchField) {
    await core.store.dispatch('search/query', { query, from, field, perPage })
    return shallowMount(SearchResultsList, {
      global: {
        plugins: core.plugins
      }
    })
  }

  beforeAll(() => {
    Murmur.config.merge({ userProjects: [index] })
    core.store.commit('search/index', index)
  })

  beforeEach(() => {
    core.store.commit('search/reset')
  })

  describe('filter the results', () => {
    it('should display no documents found', async () => {
      wrapper = await createView()

      expect(wrapper.find('.search-results-list__header__number-of-results').text()).toBe('No documents found')
    })

    it('should return 2 documents', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(4))
        .commit()
      wrapper = await createView('document', 0, 2)

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })

    it.only('should return 3 documents', async () => {
      await letData(es)
        .have(new IndexedDocuments().setBaseName('doc').withContent('document').withIndex(index).count(4))
        .commit()
      wrapper = await createView('document', 0, 3)

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(3)
    })

    it('should display all the documents that have a NE person Paris', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index).withNer('paris', 1, 'LOCATION')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index).withNer('paris')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index).withNer('paris')).commit()

      core.store.commit('search/addFilterValue', { name: 'namedEntityPerson', value: 'paris' })
      wrapper = await createView()

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })

    it('should display all the documents between the creation dates', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index).withCreationDate('2019-08-19T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index).withCreationDate('2019-08-20T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index).withCreationDate('2019-08-21T00:00:00.000Z')).commit()

      core.store.commit('search/setFilterValue', {
        name: 'creationDate',
        value: [new Date('2019-08-20').getTime(), new Date('2019-08-21').getTime()]
      })
      wrapper = await createView()

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })
  })

  it('should search with boolean', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index).withContent('first')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index).withContent('second')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index).withContent('third')).commit()

    wrapper = await createView('first')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('second')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('first second')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

    wrapper = await createView('first AND second')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(0)
  })

  it('should search with wildcards', async () => {
    await letData(es).have(new IndexedDocument('doc_01', index).withContent('first')).commit()
    await letData(es).have(new IndexedDocument('doc_02', index).withContent('firs')).commit()
    await letData(es).have(new IndexedDocument('doc_03', index).withContent('foxes')).commit()

    wrapper = await createView('firste')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(0)

    wrapper = await createView('first')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('firs?')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('firs*')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

    wrapper = await createView('f*')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(3)
  })

  describe('lucene querying', () => {
    it('should search with field names', async () => {
      await letData(es)
        .have(new IndexedDocument('doc_01', index).withContent('first').withContentType('type_01'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('doc_02', index).withContent('firs').withContentType('type_01'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('doc_03', index).withContent('foxes').withContentType('type_02'))
        .commit()

      wrapper = await createView('contentType:type_01')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('contentType:type_02')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })

    it('should search with fuzziness', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index).withContent('first')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index).withContent('firs')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index).withContent('foxes')).commit()

      wrapper = await createView('firt~')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('fokes~1')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })

    it('should search with exact query', async () => {
      await letData(es)
        .have(new IndexedDocument('doc_01', index).withContent('this should be an exact content'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('doc_02', index).withContent('this should be an approximate content'))
        .commit()
      await letData(es).have(new IndexedDocument('doc_03', index).withContent('this is an exact content')).commit()

      wrapper = await createView('"exact content"')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('"this should be an exact content"')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })

    it('should search the content without case sensitivity', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index).withContent('météo')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index).withContent('meteo')).commit()
      await letData(es).have(new IndexedDocument('doc_03', index).withContent('garçon')).commit()

      wrapper = await createView('meteo')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('météo')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('garcon')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })

    it('should search the title without case sensitivity', async () => {
      await letData(es).have(new IndexedDocument('meteo', index).withResourceName('meteo')).commit()
      await letData(es).have(new IndexedDocument('météo', index).withResourceName('météo')).commit()

      wrapper = await createView('météo*', 0, 25, 'title')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('meteo*', 0, 25, 'title')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })
  })
})
