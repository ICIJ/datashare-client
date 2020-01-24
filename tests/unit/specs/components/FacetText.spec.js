import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, createWrapper, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueI18n from 'vue-i18n'

import { App } from '@/main'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FacetText from '@/components/FacetText'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import messagesFr from '@/lang/fr'

const { localVue, router, store } = App.init(createLocalVue()).useAll()

describe('FacetText.vue', () => {
  const index = toLower('FacetText')
  const anotherIndex = toLower('AnotherFacetText')
  esConnectionHelper([index, anotherIndex])
  const es = esConnectionHelper.es
  let wrapper

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(() => {
    wrapper = mount(FacetText, {
      localVue,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'contentType' }) },
      mocks: { $t: msg => msg, $te: msg => msg, $n: msg => msg }
    })
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', index)
  })

  afterEach(() => store.commit('search/reset'))

  afterAll(() => removeCookie(process.env.VUE_APP_DS_COOKIE_NAME))

  it('should display no items for the contentType facet', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(0)
    expect(wrapper.vm.root.total).toBe(0)
  })

  it('should display 3 items for the contentType facet', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_04', index)
      .withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_05', index)
      .withContentType('text/html')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.vm.root.total).toBe(5)
  })

  it('should display 4 items for the contentType facet', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_04', index)
      .withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_05', index)
      .withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_06', index)
      .withContentType('text/stylesheet')).commit()
    await letData(es).have(new IndexedDocument('document_07', index)
      .withContentType('text/stylesheet')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    expect(wrapper.vm.root.total).toBe(7)
  })

  it('should display X facet items after applying the relative search', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContent('INDEX').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContent('LIST').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContent('SHOW').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_04', index)
      .withContent('INDEX').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_05', index)
      .withContent('LIST').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_06', index)
      .withContent('LIST').withContentType('text/stylesheet')).commit()

    store.commit('search/query', 'SHOW')
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    expect(wrapper.vm.root.total).toBe(6)

    store.commit('search/setGlobalSearch', false)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)

    store.commit('search/query', 'INDEX')
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
  })

  it('should apply relative facet and get back to global facet', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContent('Ipsum').withContentType('text/html')).commit()

    store.commit('search/query', 'Lorem')
    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.vm.root.total).toBe(2)

    store.commit('search/setGlobalSearch', false)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)

    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
  })

  it('should display an item for inverted facet', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('text/javascript')).commit()

    store.commit('search/addFacetValue', { name: 'contentType', value: 'text/javascript' })
    store.commit('search/excludeFacet', 'contentType')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet--reversed .facet__items__item .facet__items__item__count').at(0).text()).toBe('2')
    expect(wrapper.vm.root.total).toBe(3)
  })

  it('should filter facet values', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_12', index)
      .withContentType('text/type_12')).commit()
    await letData(es).have(new IndexedDocument('document_13', index)
      .withContentType('text/type_13')).commit()

    wrapper.vm.root.facetQuery = 'text/type_0'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(3)
    expect(wrapper.vm.root.total).toBe(5)
  })

  it('should filter facet values with no results', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_04', index)
      .withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_05', index)
      .withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_06', index)
      .withContentType('text/type_03')).commit()

    wrapper.vm.root.facetQuery = 'yolo'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(0)
    expect(wrapper.vm.root.total).toBe(6)
  })

  it('should filter facet values - Uppercase situation', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/csv')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('plain/text')).commit()

    wrapper.vm.root.facetQuery = 'TEX'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.total).toBe(2)
  })

  it('should filter facet values on facet item', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('image/wmf')).commit()
    await letData(es).have(new IndexedDocument('document_04', index)
      .withContentType('image/emf')).commit()

    wrapper.vm.root.facetQuery = 'image'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.total).toBe(4)
  })

  it('should filter facet values on facet label', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('message/rfc822')).commit()

    wrapper.vm.root.facetQuery = 'Internet'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(1)
    expect(wrapper.vm.root.items[0].doc_count).toBe(2)
    expect(wrapper.vm.root.total).toBe(3)
  })

  it('should filter facet values on facet label in capital letters', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('message/rfc822')).commit()

    wrapper.vm.root.facetQuery = 'EMAIL'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(1)
    expect(wrapper.vm.root.items[0].doc_count).toBe(2)
    expect(wrapper.vm.root.total).toBe(3)
  })

  it('should fire 2 events on click on facet item', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = jest.spyOn(wrapper.vm.root, 'refreshRoute')
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('type_01')).commit()
    await wrapper.vm.root.aggregate()
    wrapper.find('.facet__items__item:nth-child(1) input').trigger('click')

    expect(wrapper.emitted('add-facet-values')).toHaveLength(1)
    expect(rootWrapper.emitted('facet::add-facet-values')).toHaveLength(1)
    expect(spyRefreshRoute).toBeCalledTimes(1)
  })

  it('should reset the from query on click on facet item', async () => {
    store.commit('search/from', 25)
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('type_01')).commit()
    await wrapper.vm.root.aggregate()
    wrapper.find('.facet__items__item:nth-child(1) input').trigger('click')

    expect(store.state.search.from).toBe(0)
  })

  it('should return facets from another index', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', anotherIndex)
      .withContentType('text/javascript')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
    expect(wrapper.vm.root.total).toBe(2)

    store.commit('search/index', anotherIndex)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.vm.root.total).toBe(1)
  })

  it('should display an "All" item on top of others items, and this item should be active by default', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/html')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__all')).toHaveLength(1)
    expect(wrapper.find('.facet__items__all .facet__items__item__label').text()).toBe('all')
    expect(wrapper.findAll('.facet__items__all .facet__items__item__count').at(0).text()).toBe('2')
    expect(wrapper.find('.facet__items__all .custom-control-input').element.checked).toBeTruthy()
    expect(wrapper.vm.root.total).toBe(2)
  })

  it('should trigger a click on "All" item, fire 2 events, unselect others items and refresh the route', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = jest.spyOn(wrapper.vm.root, 'refreshRoute')

    await letData(es).have(new IndexedDocument('document_01', index)
      .withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_04', index)
      .withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_05', index)
      .withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_06', index)
      .withContentType('text/type_03')).commit()

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
    await letData(es).have(new IndexedDocument('document_01', index)
      .withLanguage('ENGLISH')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toBe('Anglais')
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
    await letData(es).have(new IndexedDocument('document_01', index)
      .withLanguage('WELSH')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toBe('Gallois')
  })

  it('should display the extraction level facet with correct labels', async () => {
    wrapper.setProps({ facet: find(store.state.search.facets, { name: 'extractionLevel' }) })

    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withParent('document_01')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toBe('facet.level.level01')
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

    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withParent('document_01')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toBe('1er')
  })

  it('should reload the facet on event "facet::refresh"', () => {
    const spyRefreshFacet = jest.spyOn(wrapper.vm.root, 'aggregateWithLoading')
    wrapper.vm.root.collapseItems = false
    wrapper.vm.$root.$emit('facet::refresh', 'contentType')

    expect(spyRefreshFacet).toBeCalled()
  })

  it('should remove "tag_01" from the tags facet on event "facet::delete"', async () => {
    wrapper.setProps({ facet: find(store.state.search.facets, { name: 'tags' }) })

    await letData(es).have(new IndexedDocument('document_01', index)
      .withTags(['tag_01'])).commit()
    await letData(es).have(new IndexedDocument('document_02', index)
      .withTags(['tag_02'])).commit()
    await letData(es).have(new IndexedDocument('document_03', index)
      .withTags(['tag_03'])).commit()

    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(3)
    wrapper.vm.root.collapseItems = false

    wrapper.vm.$root.$emit('facet::delete', 'tags', { label: 'tag_01' })
    expect(wrapper.findAll('.facet__items__item')).toHaveLength(2)
  })

  describe('about the show more button', () => {
    it('should not display the more button if less than 8 items in the facet', async () => {
      await letData(es).have(new IndexedDocument('document_01', index)
        .withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index)
        .withContentType('text/type_02')).commit()

      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(0)
    })

    it('should display the more button if more than 8 items in the facet', async () => {
      await letData(es).have(new IndexedDocument('document_01', index)
        .withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index)
        .withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index)
        .withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_04', index)
        .withContentType('text/type_04')).commit()
      await letData(es).have(new IndexedDocument('document_05', index)
        .withContentType('text/type_05')).commit()
      await letData(es).have(new IndexedDocument('document_06', index)
        .withContentType('text/type_06')).commit()
      await letData(es).have(new IndexedDocument('document_07', index)
        .withContentType('text/type_07')).commit()
      await letData(es).have(new IndexedDocument('document_08', index)
        .withContentType('text/type_08')).commit()
      await letData(es).have(new IndexedDocument('document_09', index)
        .withContentType('text/type_09')).commit()

      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(1)
    })

    it('should not display the more button if less than 8 items in the facet after filtering', async () => {
      await letData(es).have(new IndexedDocument('document_01', index)
        .withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index)
        .withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index)
        .withContentType('text/type_03')).commit()

      wrapper.vm.root.facetQuery = 'text/type_03'
      await wrapper.vm.root.aggregate()

      expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(0)
    })
  })
})
