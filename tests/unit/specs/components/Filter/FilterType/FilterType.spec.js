import find from 'lodash/find'
import { mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'

describe('FilterType.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const { index: anotherIndex } = esConnectionHelper.build()

  let core, wrapper

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    core = CoreSetup.init({ elasticsearch: es }).useAll().useRouter()
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  describe('contentType', () => {
    beforeEach(() => {
      const name = 'contentType'
      const filter = core.store.getters['search/getFilter']({ name })

      wrapper = mount(FilterType, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter
        }
      })

      wrapper.vm.$store.commit('search/decontextualizeFilter', name)
      wrapper.vm.$store.commit('search/index', index)
      wrapper.vm.$store.commit('search/reset')
    })

    it('should display no items for the contentType filter', async () => {
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(0)
      expect(wrapper.vm.lastPage.total).toBe(0)
    })

    it('should display 2 items for the contentType filter', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(5)
    })

    it('should filter according to the others filters if contextualized search', async () => {
      await letData(es)
        .have(new IndexedDocument('document_01', index).withContentType('type_01').withLanguage('ENGLISH'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_02', index).withContentType('type_02').withLanguage('FRENCH'))
        .commit()

      wrapper.vm.$store.commit('search/contextualizeFilter', 'contentType')
      wrapper.vm.$store.commit('search/setFilterValue', { name: 'language', value: 'ENGLISH' })
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)
      expect(wrapper.vm.lastPage.total).toBe(1)
    })

    it('should display 3 items for the contentType filter', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/stylesheet')).commit()
      await letData(es).have(new IndexedDocument('document_07', index).withContentType('text/stylesheet')).commit()

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(3)
      expect(wrapper.vm.lastPage.total).toBe(7)
    })

    it('should display 3 items for the contentType filter alphabeticaly', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/stylesheet')).commit()

      wrapper.vm.$store.commit('search/sortFilter', { name, sortBy: '_key', orderBy: 'asc' })
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(3)

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(3)
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(0).text()).toEqual('HTML document')
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(1).text()).toEqual('text/javascript')
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(2).text()).toEqual('text/stylesheet')
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
      wrapper.vm.$store.commit('search/decontextualizeFilter', 'contentType')
      await wrapper.vm.aggregate({ clearPages: true })
      expect(wrapper.vm.lastPage.total).toBe(6)
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(3)

      wrapper.vm.$store.commit('search/contextualizeFilter', 'contentType')
      await wrapper.vm.aggregate({ clearPages: true })
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)

      wrapper.vm.$store.commit('search/query', 'INDEX')
      await wrapper.vm.aggregate({ clearPages: true })
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
    })

    it('should apply relative filter and get back to global filter', async () => {
      await letData(es)
        .have(new IndexedDocument('document_01', index).withContent('Lorem').withContentType('text/javascript'))
        .commit()
      await letData(es)
        .have(new IndexedDocument('document_02', index).withContent('Ipsum').withContentType('text/html'))
        .commit()

      wrapper.vm.$store.commit('search/query', 'Lorem')
      wrapper.vm.$store.commit('search/decontextualizeFilter', 'contentType')
      await wrapper.vm.aggregate({ clearPages: true })
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(2)

      wrapper.vm.$store.commit('search/contextualizeFilter', 'contentType')
      await wrapper.vm.aggregate({ clearPages: true })
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)

      wrapper.vm.$store.commit('search/decontextualizeFilter', 'contentType')
      await wrapper.vm.aggregate({ clearPages: true })
      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
    })

    it('should display an item for excluded filter', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/javascript')).commit()

      wrapper.vm.$store.commit('search/addFilterValue', { name: 'contentType', value: 'text/javascript' })
      wrapper.vm.$store.commit('search/excludeFilter', 'contentType')

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAll('.filters-panel-section-filter-entry__count').at(0).text()).toBe('2')
      expect(wrapper.vm.lastPage.total).toBe(3)
    })

    it('should filter filter values', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_12', index).withContentType('text/type_12')).commit()
      await letData(es).have(new IndexedDocument('document_13', index).withContentType('text/type_13')).commit()

      wrapper.vm.query = 'text/type_0'

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.vm.entries).toHaveLength(3)
      expect(wrapper.vm.lastPage.total).toBe(5)
    })

    it('should filter filter values with no results', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/type_01')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/type_02')).commit()
      await letData(es).have(new IndexedDocument('document_04', index).withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_05', index).withContentType('text/type_03')).commit()
      await letData(es).have(new IndexedDocument('document_06', index).withContentType('text/type_03')).commit()

      wrapper.vm.query = 'yolo'

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.vm.entries).toHaveLength(0)
      expect(wrapper.vm.lastPage.total).toBe(6)
    })

    it('should filter filter values - Uppercase situation', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('text/csv')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('plain/text')).commit()

      wrapper.vm.query = 'TEX'

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.vm.entries).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(2)
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

      wrapper.vm.query = 'image'

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.vm.entries).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(4)
    })

    it('should filter filter values on filter label', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('message/rfc822')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('another_type')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('message/rfc822')).commit()

      wrapper.vm.query = 'Internet'

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.vm.entries).toHaveLength(1)
      expect(wrapper.vm.entries[0].item.doc_count).toBe(2)
      expect(wrapper.vm.lastPage.total).toBe(3)
    })

    it('should filter filter values on filter label in capital letters', async () => {
      await letData(es).have(new IndexedDocument('document_01', index).withContentType('message/rfc822')).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withContentType('another_type')).commit()
      await letData(es).have(new IndexedDocument('document_03', index).withContentType('message/rfc822')).commit()

      wrapper.vm.query = 'EMAIL'

      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.vm.entries).toHaveLength(1)
      expect(wrapper.vm.entries[0].item.doc_count).toBe(2)
      expect(wrapper.vm.lastPage.total).toBe(3)
    })

    it('should return filters from another index', async () => {
      await letData(es).have(new IndexedDocument('doc_01', index).withContentType('text/javascript')).commit()
      await letData(es).have(new IndexedDocument('doc_02', index).withContentType('text/html')).commit()
      await letData(es).have(new IndexedDocument('doc_03', anotherIndex).withContentType('text/javascript')).commit()
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.vm.lastPage.total).toBe(2)

      wrapper.vm.$store.commit('search/index', anotherIndex)
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)
      expect(wrapper.vm.lastPage.total).toBe(1)
    })
  })

  describe('language', () => {
    beforeEach(() => {
      const name = 'language'
      const filter = core.store.getters['search/getFilter']({ name })

      wrapper = mount(FilterType, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter
        }
      })

      wrapper.vm.$store.commit('search/decontextualizeFilter', name)
      wrapper.vm.$store.commit('search/index', index)
      wrapper.vm.$store.commit('search/reset')
    })

    it('should display the language filter in French', async () => {
      await core.loadI18Locale('fr')
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('ENGLISH')).commit()
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(0).text()).toBe('Anglais')
    })

    it('should translate any weird language', async () => {
      await core.loadI18Locale('fr')
      wrapper = mount(FilterType, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter: wrapper.vm.$store.getters['search/getFilter']({ name: 'language' })
        }
      })
      await letData(es).have(new IndexedDocument('document_01', index).withLanguage('WELSH')).commit()
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(1)
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(0).text()).toBe('Gallois')
    })
  })

  describe('extractionLevel', () => {
    beforeEach(() => {
      const name = 'extractionLevel'
      const filter = core.store.getters['search/getFilter']({ name })

      wrapper = mount(FilterType, {
        global: {
          plugins: core.plugins
        },
        props: {
          filter
        }
      })

      wrapper.vm.$store.commit('search/decontextualizeFilter', name)
      wrapper.vm.$store.commit('search/index', index)
      wrapper.vm.$store.commit('search/reset')
    })

    it('should display the extraction level filter with correct labels', async () => {
      wrapper.setProps({
        filter: find(core.store.getters['search/instantiatedFilters'], { name: 'extractionLevel' })
      })

      await letData(es).have(new IndexedDocument('document_01', index)).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withParent('document_01')).commit()
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(0).text()).toBe('File on disk')
    })

    it('should display the extraction level filter with correct labels in French', async () => {
      await core.loadI18Locale('fr')
      const filter = wrapper.vm.$store.getters['search/getFilter']({ name: 'extractionLevel' })

      wrapper = mount(FilterType, { global: { plugins: core.plugins }, props: { filter } })

      await letData(es).have(new IndexedDocument('document_01', index)).commit()
      await letData(es).have(new IndexedDocument('document_02', index).withParent('document_01')).commit()
      await wrapper.vm.aggregate({ clearPages: true })

      expect(wrapper.findAllComponents(FiltersPanelSectionFilterEntry)).toHaveLength(2)
      expect(wrapper.findAll('.filters-panel-section-filter-entry__label').at(0).text()).toBe('Fichier sur disque')
    })
  })
})
