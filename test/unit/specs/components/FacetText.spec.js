import 'es6-promise/auto'

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'

import noop from 'lodash/noop'
import find from 'lodash/find'
import trim from 'lodash/trim'

import {mount, createLocalVue} from 'vue-test-utils'
import {IndexedDocument, letData} from 'test/unit/es_utils'

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
    store.commit('aggregation/global', false)
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
    store.commit('aggregation/global', true)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(2)

    store.commit('aggregation/global', false)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(1)

    store.commit('aggregation/global', true)
    await wrapped.vm.aggregate()
    await Vue.nextTick()
    expect(wrapped.vm.$el.querySelectorAll('.facet-text__items__item').length).to.equal(2)
  })

  it('should display an item for inverted facet with no docs', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('Lorem').withContentType('text/html')).commit()

    store.commit('search/query', '*')
    store.commit('aggregation/global', false)
    store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
    store.commit('search/excludeFacet', 'content-type')

    await wrapped.vm.aggregate()
    await Vue.nextTick()

    const lastItem = wrapped.vm.$el.querySelector('.facet-text__items__item:last-child')

    expect(lastItem.classList.contains('facet-text__items__item--active')).to.equal(true)
    expect(trim(lastItem.querySelector('span').textContent)).to.equal('0')
  })
})
