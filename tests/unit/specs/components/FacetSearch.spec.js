import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import find from 'lodash/find'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import { EventBus } from '@/utils/event-bus'
import FacetSearch from '@/components/FacetSearch'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'

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
localVue.use(Murmur)

const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('FacetSearch.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(async () => {
    await store.commit('search/reset')
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
    const facet = find(store.state.search.facets, { name: 'content-type' })
    wrapper = mount(FacetSearch, { localVue, i18n, store, router, propsData: { infiniteScroll: false, throttle: 0, facet } })
  })

  it('should display 2 items', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()

    await wrapper.vm.startOver()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
  })

  it('should paginate 4 items on 2 pages', async () => {
    wrapper.vm.pageSize = 2
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()
    await letData(es).have(new IndexedDocument('index.php').withContentType('text/php')).commit()

    await wrapper.vm.startOver()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)

    await wrapper.vm.next()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(4)
  })

  it('should paginate 10 items on 10 pages', async () => {
    wrapper.vm.pageSize = 1

    await letData(es).have(new IndexedDocument('index.pdf').withContentType('pdf')).commit()
    await letData(es).have(new IndexedDocument('index.doc').withContentType('doc')).commit()
    await letData(es).have(new IndexedDocument('index.docx').withContentType('docx')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('css')).commit()
    await letData(es).have(new IndexedDocument('index.js').withContentType('js')).commit()
    await letData(es).have(new IndexedDocument('index.tx').withContentType('tx')).commit()
    await letData(es).have(new IndexedDocument('index.vue').withContentType('vue')).commit()
    await letData(es).have(new IndexedDocument('index.txt').withContentType('txt')).commit()
    await letData(es).have(new IndexedDocument('index.xls').withContentType('xls')).commit()

    await wrapper.vm.startOver()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(1)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(3)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(4)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(5)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(6)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(7)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(8)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(9)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(10)
  })

  it('should paginate 10 items on 2 pages, and start over', async () => {
    wrapper.vm.pageSize = 5

    await letData(es).have(new IndexedDocument('index.pdf').withContentType('pdf')).commit()
    await letData(es).have(new IndexedDocument('index.doc').withContentType('doc')).commit()
    await letData(es).have(new IndexedDocument('index.docx').withContentType('docx')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('css')).commit()
    await letData(es).have(new IndexedDocument('index.js').withContentType('js')).commit()
    await letData(es).have(new IndexedDocument('index.tx').withContentType('tx')).commit()
    await letData(es).have(new IndexedDocument('index.vue').withContentType('vue')).commit()
    await letData(es).have(new IndexedDocument('index.txt').withContentType('txt')).commit()
    await letData(es).have(new IndexedDocument('index.xls').withContentType('xls')).commit()

    await wrapper.vm.startOver()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(5)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(10)

    await wrapper.vm.startOver()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(5)
    await wrapper.vm.next()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(10)
  })

  it('should create query tokens', async () => {
    wrapper.vm.facetQuery = 'iCij'
    await wrapper.vm.startOver()
    expect(wrapper.vm.queryTokens).toContain('iCij')
    expect(wrapper.vm.queryTokens).toContain('icij')
    expect(wrapper.vm.queryTokens).toContain('ICIJ')
    expect(wrapper.vm.queryTokens).toContain('ICij')
  })

  it('should filter the list according to facetQuery', async () => {
    await letData(es).have(new IndexedDocument('index.jade').withContentType('jade')).commit()
    await letData(es).have(new IndexedDocument('index.doc').withContentType('doc')).commit()
    await letData(es).have(new IndexedDocument('index.docx').withContentType('docx')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('css')).commit()
    await letData(es).have(new IndexedDocument('index.js').withContentType('js')).commit()
    await letData(es).have(new IndexedDocument('index.tx').withContentType('tx')).commit()
    await letData(es).have(new IndexedDocument('index.vue').withContentType('vue')).commit()
    await letData(es).have(new IndexedDocument('index.txt').withContentType('txt')).commit()
    await letData(es).have(new IndexedDocument('index.xls').withContentType('xls')).commit()

    wrapper.setData({ facetQuery: '' })
    await wrapper.vm.startOver()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(8)

    wrapper.setData({ facetQuery: 'doc' })
    await wrapper.vm.startOver()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)

    wrapper.setData({ facetQuery: 'jade' })
    await wrapper.vm.startOver()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(1)
  })

  it('should trigger a search when value of facetQuery changes', async () => {
    jest.spyOn(wrapper.vm, 'search').mockImplementation(jest.fn)
    wrapper.vm.facetQuery = 'pdf'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.search).toHaveBeenCalled()
  })

  it('should emit a facet::hide::named-entities event on click to delete named entity', async () => {
    wrapper = mount(FacetSearch, { localVue, i18n, store, router, propsData: { infiniteScroll: false, throttle: 0, facet: find(store.state.search.facets, { name: 'named-entity-person' }) } })
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapper.vm.startOver()

    const mockCallback = jest.fn()
    EventBus.$on('facet::hide::named-entities', mockCallback)

    await wrapper.find('.facet__items__item__menu .dropdown-item:first-child').trigger('click')

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should call the search function after a named entity deletion', async () => {
    wrapper = mount(FacetSearch, { localVue, i18n, store, router, propsData: { infiniteScroll: false, throttle: 0, facet: find(store.state.search.facets, { name: 'named-entity-person' }) } })
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('this is a naz document').withNer('naz')).commit()
    await wrapper.vm.startOver()

    const spySearch = jest.spyOn(wrapper.vm, 'search')
    expect(spySearch).not.toBeCalled()

    await wrapper.find('.facet__items__item__menu .dropdown-item:first-child').trigger('click')

    expect(spySearch).toBeCalled()
    expect(spySearch).toBeCalledTimes(1)
  })

  it('should display all the indexing dates', async () => {
    wrapper = mount(FacetSearch, { localVue, i18n, store, router, propsData: { infiniteScroll: false, throttle: 0, facet: find(store.state.search.facets, { name: 'indexing-date' }) } })
    await letData(es).have(new IndexedDocument('doc_01.txt').withIndexingDate('2018-01-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withIndexingDate('2018-02-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withIndexingDate('2018-03-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withIndexingDate('2018-04-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withIndexingDate('2018-05-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_06.txt').withIndexingDate('2018-06-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_07.txt').withIndexingDate('2018-07-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_08.txt').withIndexingDate('2018-08-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_09.txt').withIndexingDate('2018-09-01T00:00:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_10.txt').withIndexingDate('2018-10-01T00:00:00.001Z')).commit()
    await wrapper.vm.startOver()
    await wrapper.vm.next()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(10)
  })
})
