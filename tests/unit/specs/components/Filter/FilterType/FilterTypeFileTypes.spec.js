import { flushPromises, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeFileTypes from '@/components/Filter/FilterType/FilterTypeFileTypes'
import ButtonToggleFileTypesGrouped from '@/components/Button/ButtonToggleFileTypesGrouped'
import FileTypesViewCategory from '@/components/FileTypes/FileTypesView/FileTypesViewCategory'
import FileTypesViewCategoryEntry from '@/components/FileTypes/FileTypesView/FileTypesViewCategoryEntry'
import FileTypesViewEntry from '@/components/FileTypes/FileTypesView/FileTypesViewEntry'
import { apiInstance as api } from '@/api/apiInstance'
import { useSearchStore } from '@/store/modules'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()
  return {
    apiInstance: {
      ...apiInstance,
      getContentTypesGrouppedByCategories: vi.fn()
    }
  }
})

describe('FilterTypeFileTypes.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, wrapper, searchStore

  beforeAll(() => {
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    api.getContentTypesGrouppedByCategories.mockClear()
    api.getContentTypesGrouppedByCategories.mockResolvedValue({})

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

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
    vi.resetAllMocks()
  })

  it('should render a ButtonToggleFileTypesGrouped in the actions slot', () => {
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).exists()).toBe(true)
  })

  it('should have grouped set to true by default', () => {
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).props('grouped')).toBe(true)
  })

  it('should toggle grouped to false when the button is clicked', async () => {
    await wrapper.findComponent(ButtonToggleFileTypesGrouped).trigger('click')
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).props('grouped')).toBe(false)
  })

  it('should toggle grouped back to true on second click', async () => {
    const button = wrapper.findComponent(ButtonToggleFileTypesGrouped)
    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.findComponent(ButtonToggleFileTypesGrouped).props('grouped')).toBe(true)
  })

  it('should render category groups when entries are aggregated in grouped mode', async () => {
    api.getContentTypesGrouppedByCategories.mockResolvedValue({
      Documents: ['application/pdf'],
      Other: ['text/html', 'other']
    })

    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('other')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()
    await flushPromises()

    expect(wrapper.findAllComponents(FileTypesViewCategory)).toHaveLength(2)
    expect(wrapper.findAllComponents(FileTypesViewCategoryEntry)).toHaveLength(3)
    expect(wrapper.findAllComponents(FileTypesViewEntry)).toHaveLength(0)
  })

  it('should render flat entries when grouped is toggled off', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()
    await letData(es).have(new IndexedDocument('document_03', index).withContentType('other')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()
    await flushPromises()
    await wrapper.findComponent(ButtonToggleFileTypesGrouped).trigger('click')

    expect(wrapper.findAllComponents(FileTypesViewCategory)).toHaveLength(0)
    expect(wrapper.findAllComponents(FileTypesViewEntry)).toHaveLength(3)
  })

  it('should pass aggregated content types to the categories API', async () => {
    await letData(es).have(new IndexedDocument('document_01', index).withContentType('application/pdf')).commit()
    await letData(es).have(new IndexedDocument('document_02', index).withContentType('text/html')).commit()

    await wrapper.findComponent(FilterType).vm.aggregateOver()
    await flushPromises()

    expect(api.getContentTypesGrouppedByCategories).toHaveBeenCalledWith(
      expect.arrayContaining(['application/pdf', 'text/html'])
    )
  })
})
