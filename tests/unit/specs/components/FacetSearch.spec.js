import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import find from 'lodash/find'

import { createLocalVue, mount } from '@vue/test-utils'
import { IndexedDocument, letData } from '../../es_utils'

import esConnectionHelper from '../utils/esConnectionHelper'
import messages from '@/messages'
import store from '@/store'
import router from '@/router'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import FacetSearch from '@/components/FacetSearch'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})

describe('FacetSearch.vue', () => {
  esConnectionHelper()
  var es = esConnectionHelper.es
  var wrapped = null

  beforeEach(async () => {
    wrapped = mount(FacetSearch, {
      localVue,
      i18n,
      store,
      router,
      propsData: {
        facet: find(store.state.aggregation.facets, { name: 'content-type' })
      }
    })
  })

  it('should display 2 items', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(2)
  })

  it('should paginate 4 items on 2 pages', async () => {
    wrapped.vm.pageSize = 2
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/css')).commit()
    await letData(es).have(new IndexedDocument('index.php').withContentType('text/php')).commit()
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(2)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(4)
  })

  it('should paginate 10 items on 10 pages', async () => {
    wrapped.vm.pageSize = 1
    for (const type of ['pdf', 'doc', 'docx', 'html', 'css', 'js', 'tx', 'vue', 'txt', 'xls']) {
      await letData(es).have(new IndexedDocument(`index.${type}`).withContentType(type)).commit()
    }
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(1)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(2)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(3)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(4)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(5)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(6)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(7)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(8)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(9)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(10)
  })

  it('should paginate 10 items on 2 pages, and start over', async () => {
    wrapped.vm.pageSize = 5
    for (const type of ['pdf', 'doc', 'docx', 'html', 'css', 'js', 'tx', 'vue', 'txt', 'xls']) {
      await letData(es).have(new IndexedDocument(`index.${type}`).withContentType(type)).commit()
    }
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(5)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(10)
    await wrapped.vm.search(true)
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(5)
    await wrapped.vm.next()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(10)
  })

  it('should create query tokens', async () => {
    wrapped.vm.asyncQuery = 'iCij'
    expect(wrapped.vm.queryTokens).toContain('iCij')
    expect(wrapped.vm.queryTokens).toContain('icij')
    expect(wrapped.vm.queryTokens).toContain('ICIJ')
    expect(wrapped.vm.queryTokens).toContain('ICij')
  })

  it('should filter the list according to asyncQuery', async () => {
    for (const type of ['pdf', 'doc', 'docx', 'html', 'css', 'js', 'tx', 'vue', 'txt', 'xls']) {
      await letData(es).have(new IndexedDocument(`index.${type}`).withContentType(type)).commit()
    }
    wrapped.vm.asyncQuery = ''
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(10)

    wrapped.vm.asyncQuery = 'doc'
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(2)

    wrapped.vm.asyncQuery = 'pdf'
    await wrapped.vm.search()
    expect(wrapped.vm.$el.querySelectorAll('.facet-search__items__item').length).toEqual(1)
  })

  it('trigger a search when value of asyncQuery changes', async () => {
    jest.spyOn(wrapped.vm, 'search')
    wrapped.vm.asyncQuery = 'pdf'
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.search).toHaveBeenCalled()
  })
})
