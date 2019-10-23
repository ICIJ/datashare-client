import find from 'lodash/find'
import { createLocalVue, createWrapper, mount } from '@vue/test-utils'
import VueI18n from 'vue-i18n'

import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FacetText from '@/components/FacetText'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import messagesFr from '@/lang/fr'

const { localVue, i18n, router, store } = App.init(createLocalVue()).useAll()

describe('FacetText.vue', () => {
  esConnectionHelper()
  const es = esConnectionHelper.es
  let wrapper

  beforeEach(() => {
    wrapper = mount(FacetText, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'contentType' }) }
    })
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => store.commit('search/reset'))

  it('should display no items for the contentType facet', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(0)
    expect(wrapper.vm.root.total).toEqual(0)
  })

  it('should display 3 items for the contentType facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.vm.root.total).toEqual(5)
  })

  it('should display 4 items for the contentType facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/stylesheet')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContentType('text/stylesheet')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    expect(wrapper.vm.root.total).toEqual(7)
  })

  it('should display X facet items after applying the relative search', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('INDEX').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContent('LIST').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContent('SHOW').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('INDEX').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContent('LIST').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContent('LIST').withContentType('text/stylesheet')).commit()

    store.commit('search/query', 'SHOW')
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    expect(wrapper.vm.root.total).toEqual(6)

    store.commit('search/setGlobalSearch', false)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)

    store.commit('search/query', 'INDEX')
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
  })

  it('should apply relative facet and get back to global facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('Ipsum').withContentType('text/html')).commit()

    store.commit('search/query', 'Lorem')
    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.vm.root.total).toEqual(2)

    store.commit('search/setGlobalSearch', false)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)

    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
  })

  it('should display an item for inverted facet', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContentType('text/javascript')).commit()

    store.commit('search/addFacetValue', { name: 'contentType', value: 'text/javascript' })
    store.commit('search/excludeFacet', 'contentType')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet--reversed .facet__items__item .facet__items__item__count').at(0).text()).toEqual('2')
    expect(wrapper.vm.root.total).toEqual(3)
  })

  it('should not display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_05')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(5)
    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(0)
    expect(wrapper.vm.root.total).toEqual(5)
  })

  it('should display the more button and its font awesome icon', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_06')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
    expect(wrapper.vm.root.total).toEqual(6)
  })

  it('should display all the facet values and the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_06')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(6)
    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
    expect(wrapper.vm.root.total).toEqual(6)
  })

  it('should filter facet values and display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_05')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_06')).commit()

    wrapper.vm.root.facetQuery = 'text/type_0'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(6)
    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(1)
    expect(wrapper.find('.facet__items__display > span').text()).toEqual('Show more')
    expect(wrapper.vm.root.total).toEqual(6)
  })

  it('should filter facet values but no more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_03')).commit()

    wrapper.vm.root.facetQuery = 'text/type_03'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(0)
    expect(wrapper.vm.root.total).toEqual(6)
  })

  it('should filter facet values', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_03')).commit()

    wrapper.vm.root.facetQuery = 'yolo'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(0)
    expect(wrapper.vm.root.total).toEqual(6)
  })

  it('should filter facet values - Uppercase situation 2/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/csv')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('plain/text')).commit()

    wrapper.vm.root.facetQuery = 'TEX'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.total).toEqual(2)
  })

  it('should filter facet values on facet item', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('image/wmf')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('image/emf')).commit()

    wrapper.vm.root.facetQuery = 'image'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.total).toEqual(4)
  })

  it('should filter facet values on facet label', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContentType('message/rfc822')).commit()

    wrapper.vm.root.facetQuery = 'Internet'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(1)
    expect(wrapper.vm.root.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.root.total).toEqual(3)
  })

  it('should filter facet values on facet label in capital letters', async () => {
    await letData(es).have(new IndexedDocument('doc_01')
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('doc_02')
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('doc_03')
      .withContentType('message/rfc822')).commit()

    wrapper.vm.root.facetQuery = 'EMAIL'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(1)
    expect(wrapper.vm.root.items[0].doc_count).toEqual(2)
    expect(wrapper.vm.root.total).toEqual(3)
  })

  it('should fire 2 events on click on facet item', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = jest.spyOn(wrapper.vm.root, 'refreshRoute')
    await letData(es).have(new IndexedDocument('doc_01').withContentType('type_01')).commit()
    await wrapper.vm.root.aggregate()
    wrapper.find('.facet__items__item:nth-child(1) input').trigger('click')

    expect(wrapper.emitted('add-facet-values')).toHaveLength(1)
    expect(rootWrapper.emitted('facet::add-facet-values')).toHaveLength(1)
    expect(spyRefreshRoute).toBeCalledTimes(1)
  })

  it('should reset the from query on click on facet item', async () => {
    store.commit('search/from', 25)
    await letData(es).have(new IndexedDocument('doc_01').withContentType('type_01')).commit()
    await wrapper.vm.root.aggregate()
    wrapper.find('.facet__items__item:nth-child(1) input').trigger('click')

    expect(store.state.search.from).toBe(0)
  })

  it('should return facets from another index', async () => {
    await letData(es).have(new IndexedDocument('docs/foo.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('docs/foo.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('docs/bar.js').toIndex(process.env.VUE_APP_ES_ANOTHER_INDEX).withContentType('text/javascript')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.vm.root.total).toEqual(2)

    store.commit('search/index', process.env.VUE_APP_ES_ANOTHER_INDEX)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.vm.root.total).toEqual(1)
  })

  it('should display an "All" item on top of others items, and this item should be active by default', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__all')).toHaveLength(1)
    expect(wrapper.find('.facet__items__all .facet__items__item__label').text()).toEqual('All')
    expect(wrapper.findAll('.facet__items__all .facet__items__item__count').at(0).text()).toEqual('2')
    expect(wrapper.find('.facet__items__all .custom-control-input').element.checked).toBeTruthy()
    expect(wrapper.vm.root.total).toEqual(2)
  })

  it('should trigger a click on "All" item, fire 2 events, unselect others items and refresh the route', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = jest.spyOn(wrapper.vm.root, 'refreshRoute')

    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_03')).commit()

    await wrapper.vm.root.aggregate()
    wrapper.find('.facet__items__item:nth-child(2) input').trigger('click')
    wrapper.find('.facet__items__all input').trigger('click')

    expect(wrapper.emitted('add-facet-values')).toHaveLength(2)
    expect(rootWrapper.emitted('facet::add-facet-values')).toHaveLength(2)
    expect(spyRefreshRoute).toBeCalled()
    expect(spyRefreshRoute).toBeCalledTimes(2)
    expect(wrapper.vm.root.selected).toHaveLength(0)
  })

  it('should display the language facet in French', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { 'fr': messagesFr } })
    wrapper = mount(FacetText, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'language' }) }
    })
    await letData(es).have(new IndexedDocument('doc_01.txt').withLanguage('ENGLISH')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toEqual('Anglais')
  })

  it('should translate any weird language', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { 'fr': messagesFr } })
    wrapper = mount(FacetText, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'language' }) }
    })
    await letData(es).have(new IndexedDocument('doc_01.txt').withLanguage('WELSH')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toEqual('Gallois')
  })

  it('should display the extraction level facet with correct labels', async () => {
    wrapper = mount(FacetText, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'extractionLevel' }) }
    })
    await letData(es).have(new IndexedDocument('parent.txt')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withParent('parent.txt')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toEqual('1st')
  })

  it('should display the extraction level facet with correct labels in French', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { 'fr': messagesFr } })
    wrapper = mount(FacetText, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'extractionLevel' }) }
    })
    await letData(es).have(new IndexedDocument('parent.txt')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withParent('parent.txt')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toEqual('1er')
  })

  it('should reload the facet on event "facet::refresh"', () => {
    const spyRefreshFacet = jest.spyOn(wrapper.vm.root, 'aggregateWithLoading')
    wrapper.vm.root.collapseItems = false
    wrapper.vm.$root.$emit('facet::refresh', 'contentType')

    expect(spyRefreshFacet).toBeCalled()
  })
})
