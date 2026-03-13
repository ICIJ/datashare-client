import { mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeFileTypes from '@/components/Filter/FilterType/FilterTypeFileTypes'
import ButtonToggleFileTypesGrouped from '@/components/Button/ButtonToggleFileTypesGrouped'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useSearchStore } from '@/store/modules'

describe('FilterTypeFileTypes.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, wrapper, searchStore

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    core = CoreSetup.init().useAll()
    searchStore = useSearchStore()
    const filter = searchStore.getFilter({ name: 'contentType' })

    searchStore.setIndex(index)
    searchStore.reset()
    searchStore.resetFilters()

    wrapper = mount(FilterTypeFileTypes, {
      global: {
        plugins: core.plugins
      },
      props: { filter, collapse: false }
    })
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  it('should render a ButtonToggleFileTypesGrouped in the actions slot', () => {
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).exists()).toBe(true)
  })

  it('should have grouped set to false by default', () => {
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).props('grouped')).toBe(false)
  })

  it('should toggle grouped to true when the button is clicked', async () => {
    await wrapper.findComponent(ButtonToggleFileTypesGrouped).trigger('click')
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).props('grouped')).toBe(true)
  })

  it('should toggle grouped back to false on second click', async () => {
    const button = wrapper.findComponent(ButtonToggleFileTypesGrouped)
    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).props('grouped')).toBe(false)
  })

  it('should display matching entries', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_04', index).withContentType('other')).commit()
    await letData(es).have(new IndexedDocument('document_05', index).withContentType('other')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()

    const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
    expect(entries).toHaveLength(4) // Including "All"
  })
})
