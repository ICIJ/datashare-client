import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, createWrapper, mount } from '@vue/test-utils'
import { IndexedDocument, letData } from 'tests/unit/es_utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import vBFormCheckbox from 'bootstrap-vue/es/components/form-checkbox/form-checkbox'
import vBFormCheckboxGroup from 'bootstrap-vue/es/components/form-checkbox/form-checkbox-group'
import FacetText from '@/components/FacetText'
import messages from '@/lang/en'
import messagesFr from '@/lang/fr'
import router from '@/router'
import store from '@/store'
import find from 'lodash/find'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(Vuex)
localVue.component('b-form-checkbox', vBFormCheckbox)
localVue.component('b-form-checkbox-group', vBFormCheckboxGroup)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

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
      propsData: { facet: find(store.state.search.facets, { name: 'content-type' }) }
    })
    store.commit('search/setGlobalSearch', true)
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  afterEach(() => store.commit('search/reset'))

  it('should display no items for the content-type facet', async () => {
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(0)
    expect(wrapper.vm.root.totalCount).toEqual(0)
  })

  it('should display 3 items for the content-type facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
    expect(wrapper.vm.root.totalCount).toEqual(5)
  })

  it('should display 4 items for the content-type facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('list.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('show.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('list.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('index.css').withContentType('text/stylesheet')).commit()
    await letData(es).have(new IndexedDocument('list.css').withContentType('text/stylesheet')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(3)
    expect(wrapper.vm.root.totalCount).toEqual(7)
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
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(3)
    expect(wrapper.vm.root.totalCount).toEqual(6)

    store.commit('search/setGlobalSearch', false)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(1)

    store.commit('search/query', 'INDEX')
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
  })

  it('should apply relative facet and get back to global facet', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContent('Lorem').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContent('Ipsum').withContentType('text/html')).commit()

    store.commit('search/query', 'Lorem')
    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
    expect(wrapper.vm.root.totalCount).toEqual(2)

    store.commit('search/setGlobalSearch', false)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(1)

    store.commit('search/setGlobalSearch', true)
    await wrapper.vm.root.aggregate()
    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
  })

  it('should display an item for inverted facet', async () => {
    await letData(es).have(new IndexedDocument('doc_01.txt').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('doc_02.txt').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('doc_03.txt').withContentType('text/javascript')).commit()

    store.commit('search/addFacetValue', { name: 'content-type', value: 'text/javascript' })
    store.commit('search/excludeFacet', 'content-type')

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet--reversed .facet__items__item .custom-checkbox .facet__items__item__count').at(0).text()).toEqual('2')
    expect(wrapper.vm.root.totalCount).toEqual(3)
  })

  it('should not display the more button', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_04')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_05')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(5)
    expect(wrapper.findAll('.facet__items__display > span')).toHaveLength(0)
    expect(wrapper.vm.root.totalCount).toEqual(5)
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
    expect(wrapper.vm.root.totalCount).toEqual(6)
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
    expect(wrapper.vm.root.totalCount).toEqual(6)
  })

  it('should filter facet values 1/3 and display the more button', async () => {
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
    expect(wrapper.vm.root.totalCount).toEqual(6)
  })

  it('should filter facet values 2/3 but no more button', async () => {
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
    expect(wrapper.vm.root.totalCount).toEqual(3)
  })

  it('should filter facet values 3/3', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_05.txt').withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('index_06.txt').withContentType('text/type_03')).commit()

    wrapper.vm.root.facetQuery = 'yolo'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(0)
    expect(wrapper.vm.root.totalCount).toEqual(0)
  })

  it('should filter facet values - Uppercase situation 1/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('TEXT/CSV')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('PLAIN/TEXT')).commit()

    wrapper.vm.root.facetQuery = 'tex'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.totalCount).toEqual(2)
  })

  it('should filter facet values - Uppercase situation 2/2', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('text/csv')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('plain/text')).commit()

    wrapper.vm.root.facetQuery = 'TEX'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.totalCount).toEqual(2)
  })

  it('should filter facet values on facet label', async () => {
    await letData(es).have(new IndexedDocument('index_01.txt').withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('index_02.txt').withContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).commit()
    await letData(es).have(new IndexedDocument('index_03.txt').withContentType('image/wmf')).commit()
    await letData(es).have(new IndexedDocument('index_04.txt').withContentType('image/emf')).commit()

    wrapper.vm.root.facetQuery = 'image'

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.root.items).toHaveLength(2)
    expect(wrapper.vm.root.totalCount).toEqual(2)
  })

  it('should fire 2 events on click on facet item', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = jest.spyOn(wrapper.vm.root, 'refreshRoute')
    await letData(es).have(new IndexedDocument('doc_01').withContentType('type_01')).commit()
    await wrapper.vm.root.aggregate()
    wrapper.find('.facet__items__item .custom-checkbox:nth-child(1) input').trigger('click')

    expect(wrapper.emitted('add-facet-values')).toHaveLength(1)
    expect(rootWrapper.emitted('facet::add-facet-values')).toHaveLength(1)
    expect(spyRefreshRoute).toBeCalled()
    expect(spyRefreshRoute).toBeCalledTimes(1)
  })

  it('should return facets from another index', async () => {
    await letData(es).have(new IndexedDocument('docs/foo.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('docs/foo.html').withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('docs/bar.js').toIndex(process.env.VUE_APP_ES_ANOTHER_INDEX).withContentType('text/javascript')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(2)
    expect(wrapper.vm.root.totalCount).toEqual(2)

    store.commit('search/index', process.env.VUE_APP_ES_ANOTHER_INDEX)
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item .custom-checkbox')).toHaveLength(1)
    expect(wrapper.vm.root.totalCount).toEqual(1)
  })

  it('should display an "All" item on top of others items, and this item should be active by default', async () => {
    await letData(es).have(new IndexedDocument('index.js').withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('index.html').withContentType('text/html')).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__all')).toHaveLength(1)
    expect(wrapper.find('.facet__items__all .facet__items__item__label').text()).toEqual('All')
    expect(wrapper.findAll('.facet__items__all .facet__items__item__count').at(0).text()).toEqual('2')
    expect(wrapper.find('.facet__items__all .custom-control-input').element.checked).toBeTruthy()
    expect(wrapper.vm.root.totalCount).toEqual(2)
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
    wrapper.find('.facet__items__item .custom-checkbox:nth-child(2) input').trigger('click')
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
      propsData: { facet: find(store.state.search.facets, { name: 'extraction-level' }) }
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
      propsData: { facet: find(store.state.search.facets, { name: 'extraction-level' }) }
    })
    await letData(es).have(new IndexedDocument('parent.txt')).commit()
    await letData(es).have(new IndexedDocument('child.txt').withParent('parent.txt')).commit()
    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.facet__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.facet__items__item .facet__items__item__label').at(0).text()).toEqual('1er')
  })

  describe('FacetDate', () => {
    beforeEach(() => {
      wrapper = mount(FacetText, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'creation-date' }) } })
    })

    it('should display an indexing date facet with 2 months', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withCreationDate('2018-04-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withCreationDate('2018-05-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('doc_03')
        .withCreationDate('2018-05-01T00:00:00.000Z')).commit()

      await wrapper.vm.root.aggregate()

      const getItem = (idx) => wrapper.findAll('.facet__items__item .custom-checkbox').at(idx)
      const getItemChild = (idx, selector) => getItem(idx).find(selector)
      const getItemChildText = (idx, selector) => getItemChild(idx, selector).text()

      expect(wrapper.vm.root.items).toHaveLength(2)
      expect(getItemChildText(0, '.facet__items__item__label')).toEqual('2018-05')
      expect(getItemChildText(0, '.facet__items__item__count')).toEqual('2')
      expect(getItemChildText(1, '.facet__items__item__label')).toEqual('2018-04')
      expect(getItemChildText(1, '.facet__items__item__count')).toEqual('1')
      expect(wrapper.vm.root.totalCount).toEqual(3)
    })

    it('should display missing dates as "Missing" item', async () => {
      await letData(es).have(new IndexedDocument('doc_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02')).commit()

      await wrapper.vm.root.aggregate()

      expect(wrapper.vm.root.items).toHaveLength(1)
      expect(wrapper.find('.facet__items__item .facet__items__item__label').text()).toEqual('Missing')
      expect(wrapper.find('.facet__items__item .facet__items__item__count').text()).toEqual('2')
    })
  })
})
