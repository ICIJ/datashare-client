import 'es6-promise/auto'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import { find, noop, trim } from 'lodash'

import { createLocalVue, mount } from 'vue-test-utils'
import { IndexedDocument, letData } from 'test/unit/es_utils'

import esConnectionHelper from 'test/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import ContentPlaceholder from '@/components/ContentPlaceholder'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FacetText from '@/components/FacetText'

Vue.use(VueI18n)
Vue.use(VueProgressBar, { color: '#852308' })

const i18n = new VueI18n({locale: 'en', messages})
Vue.component('content-placeholder', ContentPlaceholder)
Vue.component('font-awesome-icon', FontAwesomeIcon)

describe('FacetText.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null
  beforeEach(async () => {
    const localVue = createLocalVue()
    localVue.use(VueI18n)
    FacetText.watchedForUpdate = noop
    wrapped = mount(FacetText, {
      i18n,
      router,
      store,
      propsData: {
        facet: find(store.state.aggregation.facets, {name: 'content-type'})
      }
    })
    // Reset aggregation store to global search
    store.commit('aggregation/setGlobalSearch', true)
    // Reset facetQuery to default
    wrapped.vm.facetQuery = ''
  })

  it('should display empty list', async () => {
    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(0)
  })

  it('should display two facets items', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(2)
  })

  it('should display three facets items', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/stylesheet')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContentType('text/stylesheet')).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(3)
  })

  it('should display 1 facet item after applying the search', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('INDEX').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContent('LIST').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContent('SHOW').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('INDEX').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContent('LIST').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContent('LIST').withContentType('text/stylesheet')).commit()

    store.commit('search/query', 'SHOW')
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(3)
    store.commit('aggregation/setGlobalSearch', false)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(1)
    store.commit('search/query', 'INDEX')
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(2)
  })

  it('should apply relative facet and get back to global facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('Ipsum').withContentType('text/html')).commit()

    store.commit('search/query', 'Lorem')
    store.commit('aggregation/setGlobalSearch', true)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(2)

    store.commit('aggregation/setGlobalSearch', false)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(1)

    store.commit('aggregation/setGlobalSearch', true)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(2)
  })

  it('should display an item for inverted facet with no docs', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('Lorem').withContentType('text/html')).commit()

    store.commit('search/query', '*')
    store.commit('aggregation/setGlobalSearch', false)
    store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
    store.commit('search/excludeFacet', 'content-type')

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    const lastItem = wrapped.vm.$el.querySelector('.facet-text__items__item:last-child')

    expect(lastItem.classList.contains('facet-text__items__item--active')).to.equal(true)
    expect(trim(lastItem.querySelector('span').textContent)).to.equal('0')
  })

  it('should not display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(5)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).to.equal(0)
  })

  it('should display the more button and its font awesome icon', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_06')).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).to.equal(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet__items__display> span').textContent)).to.equal('More')
    expect(trim(wrapped.vm.$el.querySelectorAll('.facet__items__display svg[data-icon="angle-down"]').length)).to.equal('1')
  })

  it('should display all the facet values and the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_06')).commit()

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(5)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).to.equal(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet__items__display> span').textContent)).to.equal('More')
    expect(trim(wrapped.vm.$el.querySelectorAll('.facet__items__display svg[data-icon="angle-down"]').length)).to.equal('1')
  })

  it('should filter facet values 1/3 and display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_06')).commit()

    wrapped.vm.facetQuery = 'text/type_0'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(5)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).to.equal(1)
    expect(trim(wrapped.vm.$el.querySelector('.facet__items__display> span').textContent)).to.equal('More')
    expect(trim(wrapped.vm.$el.querySelectorAll('.facet__items__display svg[data-icon="angle-down"]').length)).to.equal('1')
  })

  it('should filter facet values 2/3 but no more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_03')).commit()

    wrapped.vm.facetQuery = 'text/type_03'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(1)
    expect(wrapped.vm.$el.querySelectorAll('.facet__items__display > span').length).to.equal(0)
  })

  it('should filter facet values 3/3', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContent('Lorem').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContent('Lorem').withContentType('text/type_03')).commit()

    wrapped.vm.facetQuery = 'yolo'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(0)
  })

  it('should filter facet values - Uppercase situation 1/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/ENGLISH')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/FRENCH')).commit()

    wrapped.vm.facetQuery = 'en'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(2)
  })

  it('should filter facet values - Uppercase situation 2/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/english')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/french')).commit()

    wrapped.vm.facetQuery = 'EN'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(2)
  })

  it('should filter facet values on facet label', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('image/wmf')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('image/emf')).commit()

    wrapped.vm.facetQuery = 'Windows'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(2)
  })

  it('should filter facet values - Accentuated situation', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContent('Lorem').withContentType('text/marqué')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContent('Lorem').withContentType('text/remarques')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContent('Lorem').withContentType('text/autre')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContent('Lorem').withContentType('text/autre')).commit()

    wrapped.vm.facetQuery = 'marque'

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    expect(wrapped.vm.displayedFilteredItems().length).to.equal(2)
  })
})
