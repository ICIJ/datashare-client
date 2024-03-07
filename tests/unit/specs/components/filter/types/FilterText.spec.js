import find from 'lodash/find'
import { createLocalVue, createWrapper, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueI18n from 'vue-i18n'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { Core } from '@/core'
import FilterText from '@/components/filter/types/FilterText'
import messagesFr from '@/lang/fr'

describe('FilterText.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const { index: anotherIndex } = esConnectionHelper.build()
  const localVue = createLocalVue()
  const { i18n, store, router, wait } = Core.init(localVue, { elasticsearch: es }).useAll()
  const name = 'contentType'
  let wrapper = null

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    const filter = store.getters['search/getFilter']({ name })

    wrapper = mount(FilterText, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: {
        filter,
        infiniteScroll: false
      }
    })

    wrapper.vm.$store.commit('search/decontextualizeFilter', name)
    wrapper.vm.$store.commit('search/index', index)
    wrapper.vm.$store.commit('search/reset')
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  it('should display no items for the contentType filter', async () => {
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(0)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(0)
  })

  it('should display 2 items for the contentType filter', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(5)
  })

  it('should filter according to the others filters if contextualized search', async () => {
    await letData(es)
      .have(new IndexedDocument('document_01', index).withContentType('type_01').withLanguage('ENGLISH'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withContentType('type_02').withLanguage('FRENCH'))
      .commit()

    wrapper.vm.$store.commit('search/contextualizeFilter', name)
    wrapper.vm.$store.commit('search/setFilterValue', { name: 'language', value: 'ENGLISH' })
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(1)
  })

  it('should display 3 items for the contentType filter', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/stylesheet')).commit()
    await letData(es).have(new IndexedDocument('document_07', index).withContentType('text/stylesheet')).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(7)
  })

  it('should display 3 items for the contentType filter alphabeticaly', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/stylesheet')).commit()

    wrapper.vm.$store.commit('search/sortFilter', { name, sortBy: '_key', sortByOrder: 'asc' })
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toEqual('HTML document')
    expect(wrapper.findAll('.filter__items__item__label').at(2).text()).toEqual('text/javascript')
    expect(wrapper.findAll('.filter__items__item__label').at(3).text()).toEqual('text/stylesheet')
  })

  it('should display X filter items after applying the relative search', async () => {
    await letData(es)
      .have(new IndexedDocument('document_01', index).withContent('INDEX').withContentType('text/javascript'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withContent('LIST').withContentType('text/javascript'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_03', index).withContent('SHOW').withContentType('text/javascript'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_04', index).withContent('INDEX').withContentType('text/html'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_05', index).withContent('LIST').withContentType('text/html'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_06', index).withContent('LIST').withContentType('text/stylesheet'))
      .commit()

    wrapper.vm.$store.commit('search/query', 'SHOW')
    wrapper.vm.$store.commit('search/decontextualizeFilter', name)
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(6)
    expect(wrapper.findAll('.filter__items__item')).toHaveLength(3)

    wrapper.vm.$store.commit('search/contextualizeFilter', name)
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)

    wrapper.vm.$store.commit('search/query', 'INDEX')
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
  })

  it('should apply relative filter and get back to global filter', async () => {
    await letData(es)
      .have(new IndexedDocument('document_01', index).withContent('Lorem').withContentType('text/javascript'))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withContent('Ipsum').withContentType('text/html'))
      .commit()

    wrapper.vm.$store.commit('search/query', 'Lorem')
    wrapper.vm.$store.commit('search/decontextualizeFilter', name)
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(2)

    wrapper.vm.$store.commit('search/contextualizeFilter', name)
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)

    wrapper.vm.$store.commit('search/decontextualizeFilter', name)
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
  })

  it('should display an item for excluded filter', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()

    wrapper.vm.$store.commit('search/addFilterValue', { name: 'contentType', value: 'text/javascript' })
    wrapper.vm.$store.commit('search/excludeFilter', 'contentType')

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter--reversed .filter__items__item .filter__items__item__count').at(0).text()).toBe('2')
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(3)
  })

  it('should filter filter values', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_12', index).withContentType('text/type_12')).commit()
    await letData(es).have(new IndexedDocument('document_13', index).withContentType('text/type_13')).commit()

    wrapper.findComponent({ ref: 'filter' }).vm.query = 'text/type_0'

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(3)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(5)
  })

  it('should filter filter values with no results', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/type_02')).commit()
    await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/type_03')).commit()
    await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/type_03')).commit()

    wrapper.findComponent({ ref: 'filter' }).vm.query = 'yolo'

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(0)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(6)
  })

  it('should filter filter values - Uppercase situation', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/csv')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('plain/text')).commit()

    wrapper.findComponent({ ref: 'filter' }).vm.query = 'TEX'

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(2)
  })

  it('should filter filter values on filter item', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es)
      .have(
        new IndexedDocument('document_02', index).withContentType(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      )
      .commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('image/wmf')).commit()
    await letData(es).have(new IndexedDocument('document_04', index).withContentType('image/emf')).commit()

    wrapper.findComponent({ ref: 'filter' }).vm.query = 'image'

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(4)
  })

  it('should filter filter values on filter label', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('message/rfc822')).commit()

    wrapper.findComponent({ ref: 'filter' }).vm.query = 'Internet'

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(1)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.items[0].doc_count).toBe(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(3)
  })

  it('should filter filter values on filter label in capital letters', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('message/rfc822')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('another_type')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('message/rfc822')).commit()

    wrapper.findComponent({ ref: 'filter' }).vm.query = 'EMAIL'

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(1)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.items[0].doc_count).toBe(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(3)
  })

  it('should fire 2 events on click on filter item', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = vi.spyOn(wrapper.findComponent({ ref: 'filter' }).vm, 'refreshRoute')
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    await wrapper.findAll('.filter__items__item').at(0).find('input').setChecked(true)

    expect(wrapper.findComponent({ ref: 'filter' }).emitted('add-filter-values')).toHaveLength(1)
    expect(rootWrapper.emitted('filter::add-filter-values')).toHaveLength(1)
    expect(spyRefreshRoute).toBeCalledTimes(1)
  })

  it('should reset the from query on click on filter item', async () => {
    wrapper.vm.$store.commit('search/from', 25)
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    await wrapper.findAll('.filter__items__item').at(0).find('input').setChecked(true)

    expect(store.state.search.from).toBe(0)
  })

  it('should return filters from another index', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', anotherIndex).withContentType('text/javascript')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(2)

    wrapper.vm.$store.commit('search/index', anotherIndex)
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(1)
  })

  it('should display an "All" item on top of others items, and this item should be active by default', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('type_02')).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__all')).toHaveLength(1)
    expect(wrapper.find('.filter__items__all .filter__items__item__label').text()).toBe('All')
    expect(wrapper.findAll('.filter__items__all .filter__items__item__count').at(0).text()).toBe('2')
    expect(wrapper.find('.filter__items__all .custom-control-input').element.checked).toBeTruthy()
    expect(wrapper.findComponent({ ref: 'filter' }).vm.total).toBe(2)
  })

  it('should trigger a click on "All" item, fire an event, unselect others items and refresh the route', async () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    const spyRefreshRoute = vi.spyOn(wrapper.findComponent({ ref: 'filter' }).vm, 'refreshRoute')

    await letData(es).have(new IndexedDocument('document_01', index).withContentType('type_01')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('type_02')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('type_02')).commit()
    await letData(es).have(new IndexedDocument('document_04', index).withContentType('type_03')).commit()
    await letData(es).have(new IndexedDocument('document_05', index).withContentType('type_03')).commit()
    await letData(es).have(new IndexedDocument('document_06', index).withContentType('type_03')).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    await wrapper.findAll('.filter__items__item').at(2).find('input').setChecked(true)
    await wrapper.find('.filter__items__all input').setChecked(true)

    expect(wrapper.findComponent({ ref: 'filter' }).emitted('add-filter-values')).toHaveLength(2)
    expect(rootWrapper.emitted('filter::add-filter-values')).toHaveLength(2)
    expect(spyRefreshRoute).toBeCalled()
    expect(spyRefreshRoute).toBeCalledTimes(2)
    expect(wrapper.findComponent({ ref: 'filter' }).vm.selected).toHaveLength(0)
  })

  it('should display the language filter in French', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { fr: messagesFr } })
    wrapper = mount(FilterText, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: {
        filter: wrapper.vm.$store.getters['search/getFilter']({ name: 'language' })
      }
    })
    await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toBe('Anglais')
  })

  it('should translate any weird language', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { fr: messagesFr } })
    wrapper = mount(FilterText, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: {
        filter: wrapper.vm.$store.getters['search/getFilter']({ name: 'language' })
      }
    })
    await letData(es).have(new IndexedDocument('document_01', index).withLanguage('WELSH')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(1)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toBe('Gallois')
  })

  it('should display the extraction level filter with correct labels', async () => {
    wrapper.setProps({ filter: find(store.getters['search/instantiatedFilters'], { name: 'extractionLevel' }) })

    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withParent('document_01')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toBe('File on disk')
  })

  it('should display the extraction level filter with correct labels in French', async () => {
    const i18n = new VueI18n({ locale: 'fr', messages: { fr: messagesFr } })
    const filter = wrapper.vm.$store.getters['search/getFilter']({ name: 'extractionLevel' })

    wrapper = mount(FilterText, { i18n, localVue, wait, store, router, propsData: { filter } })

    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withParent('document_01')).commit()
    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toBe('Fichier sur disque')
  })

  it('should reload the filter on event "filter::refresh"', async () => {
    const spyRefreshFilter = vi.spyOn(wrapper.findComponent({ ref: 'filter' }).vm, 'aggregateWithLoading')
    wrapper.findComponent({ ref: 'filter' }).vm.collapseItems = false
    await wrapper.vm.$root.$emit('filter::refresh', 'contentType')

    expect(spyRefreshFilter).toBeCalled()
  })

  it('should remove "tag_01" from the tags filter on event "filter::delete"', async () => {
    wrapper.setProps({ filter: find(wrapper.vm.$store.getters['search/instantiatedFilters'], { name: 'tags' }) })

    await letData(es)
      .have(new IndexedDocument('document_01', index).withTags(['tag_01']))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_02', index).withTags(['tag_02']))
      .commit()
    await letData(es)
      .have(new IndexedDocument('document_03', index).withTags(['tag_03']))
      .commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate({ clearPages: true })
    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(3)
    wrapper.findComponent({ ref: 'filter' }).vm.collapseItems = false
    await wrapper.vm.$nextTick()
    await wrapper.vm.$root.$emit('filter::delete', 'tags', { label: 'tag_01' })
    expect(wrapper.findComponent({ ref: 'filter' }).vm.items).toHaveLength(2)
  })
})
