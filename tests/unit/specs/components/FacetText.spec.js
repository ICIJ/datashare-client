import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'

import find from 'lodash/find'
import noop from 'lodash/noop'
import trim from 'lodash/trim'

import { createLocalVue, mount } from '@vue/test-utils'

import { IndexedDocument, letData } from 'tests/unit/es_utils'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FacetText from '@/components/FacetText'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(BootstrapVue)

localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})

describe('FacetText.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null

  beforeEach(async () => {
    FacetText.watchedForUpdate = noop
    wrapped = mount(FacetText, {
      localVue,
      i18n,
      router,
      store,
      propsData: {
        facet: find(store.state.search.facets, {name: 'content-type'})
      }
    })
    store.commit('search/setGlobalSearch', true)
  })

  afterEach(async () => {
    await store.commit('search/reset')
  })

  it('should display empty list and the relative search checkbox', async () => {
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(0)
  })

  it('should display two facets items', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(2)
  })

  it('should display three facets items', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/stylesheet')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContentType('text/stylesheet')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(3)
  })

  it('should display X facet items after applying the relative search', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('INDEX').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContent('LIST').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContent('SHOW').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('INDEX').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContent('LIST').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContent('LIST').withContentType('text/stylesheet')).commit()

    store.commit('search/query', 'SHOW')
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(3)

    store.commit('search/setGlobalSearch', false)
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(1)

    store.commit('search/query', 'INDEX')
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(2)
  })

  it('should apply relative facet and get back to global facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('Ipsum').withContentType('text/html')).commit()

    store.commit('search/query', 'Lorem')
    store.commit('search/setGlobalSearch', true)
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(2)

    store.commit('search/setGlobalSearch', false)
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(1)

    store.commit('search/setGlobalSearch', true)
    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(2)
  })

  it('should display an item for inverted facet', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContent('Lorem').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContent('Lorem').withContentType('text/javascript')).commit()

    store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
    store.commit('search/excludeFacet', 'content-type')

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    const firstItem = wrapped.vm.$el.querySelectorAll('.facet--reversed .facet__items__item')[0]

    expect(firstItem.classList.contains('facet__items__item--active')).toEqual(true)
    expect(trim(firstItem.querySelector('span').textContent)).toEqual('2')
  })

  it('should not display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet__items__item').length).toEqual(5)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).toEqual(0)
  })

  it('should display the more button and its font awesome icon', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_06')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).toEqual(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet__items__display > span').textContent)).toEqual('Show more')
  })

  it('should display all the facet values and the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_06')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(6)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).toEqual(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet__items__display > span').textContent)).toEqual('Show more')
  })

  it('should filter facet values 1/3 and display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_06')).commit()

    wrapped.vm.root.facetQuery = 'text/type_0'

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(6)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).toEqual(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet__items__display> span').textContent)).toEqual('Show more')
  })

  it('should filter facet values 2/3 but no more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_03')).commit()

    wrapped.vm.root.facetQuery = 'text/type_03'

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(1)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).toEqual(0)
  })

  it('should filter facet values 3/3', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_03')).commit()

    wrapped.vm.root.facetQuery = 'yolo'

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(0)
  })

  it('should filter facet values - Uppercase situation 1/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/ENGLISH')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/FRENCH')).commit()

    wrapped.vm.root.facetQuery = 'en'

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(2)
  })

  it('should filter facet values - Uppercase situation 2/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/english')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/french')).commit()

    wrapped.vm.root.facetQuery = 'EN'

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(2)
  })

  it('should filter facet values on facet label', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('image/wmf')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('image/emf')).commit()

    wrapped.vm.root.facetQuery = 'image'

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    expect(wrapped.vm.root.items.length).toEqual(2)
  })

  it('should display an indexing date facet with 4 months', async () => {
    wrapped = mount(FacetText, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, {name: 'indexing-date'}) } })
    await letData(es).have(new IndexedDocument('doc_01.txt').withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withIndexingDate('2018-05-05T02:00:42.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withIndexingDate('2018-05-05T20:10:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withIndexingDate('2018-05-05T23:41:17.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withIndexingDate('2018-07-07T06:16:44.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_06.txt').withIndexingDate('2018-07-07T16:16:16.001Z')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    const getItem = (idx) => wrapped.vm.$el.querySelectorAll('.facet__items__item')[idx]
    const getItemChild = (idx, selector) => getItem(idx).querySelector(selector)
    const getItemChildText = (idx, selector) => trim(getItemChild(idx, selector).textContent)

    expect(wrapped.vm.root.items.length).toEqual(4)
    expect(getItemChildText(0, '.facet__items__item__label')).toEqual('2018-04')
    expect(getItemChildText(0, '.facet__items__item__count')).toEqual('1')
    expect(getItemChildText(1, '.facet__items__item__label')).toEqual('2018-05')
    expect(getItemChildText(1, '.facet__items__item__count')).toEqual('3')
    expect(getItemChildText(2, '.facet__items__item__label')).toEqual('2018-06')
    expect(getItemChildText(2, '.facet__items__item__count')).toEqual('0')
    expect(getItemChildText(3, '.facet__items__item__label')).toEqual('2018-07')
    expect(getItemChildText(3, '.facet__items__item__count')).toEqual('2')
  })

  it('should querying on date on click on facet link, by a route redirect', async () => {
    wrapped = mount(FacetText, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, {name: 'indexing-date'}) } })
    await letData(es).have(new IndexedDocument('doc_01.txt').withIndexingDate('2018-04-04T20:20:20.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withIndexingDate('2018-05-05T02:00:42.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withIndexingDate('2018-05-05T20:10:00.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_04.txt').withIndexingDate('2018-05-05T23:41:17.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_05.txt').withIndexingDate('2018-07-07T06:16:44.001Z')).commit()
    await letData(es).have(new IndexedDocument('doc_06.txt').withIndexingDate('2018-07-07T16:16:16.001Z')).commit()

    await wrapped.vm.root.aggregate()
    await wrapped.vm.root.$nextTick()

    const spyRefreshRoute = jest.spyOn(wrapped.vm.root, 'refreshRoute')
    expect(spyRefreshRoute).not.toBeCalled()

    wrapped.find('.list-group-item:nth-child(4) > a').trigger('click')

    expect(spyRefreshRoute).toBeCalled()
    expect(spyRefreshRoute).toBeCalledTimes(1)
    expect(wrapped.vm.$store.getters['search/toRouteQuery']).toEqual({ q: '*', size: 25, sort: 'relevance', 'f[indexing-date]': [ new Date('2018-07-01T00:00:00.000Z').getTime() ] })
  })
})
