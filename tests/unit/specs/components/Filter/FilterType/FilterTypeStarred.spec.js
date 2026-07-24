import { mount } from '@vue/test-utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { useStarredStore, useSearchStore } from '@/store/modules'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeStarred from '@/components/Filter/FilterType/FilterTypeStarred'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import CoreSetup from '~tests/unit/CoreSetup'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      elasticsearch: apiInstance.elasticsearch,
      getStarredDocuments: vi.fn().mockResolvedValue([])
    }
  }
})

describe('FilterTypeStarred.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, starredStore, searchStore, wrapper

  beforeAll(() => {
    core = CoreSetup.init().useAll()
    starredStore = useStarredStore()
    searchStore = useSearchStore()
  })

  beforeEach(() => {
    const filter = searchStore.getFilter({ name: 'starred' })
    const props = { filter }
    const global = { plugins: core.plugins }
    searchStore.setIndex(index)
    wrapper = mount(FilterTypeStarred, { props, global })
  })

  it('should display 3 items for the starred filter (including "All")', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.findComponent(FilterType).vm.aggregate()

    const labels = wrapper.findAll('.filters-panel-section-filter-entry__label')
    expect(labels).toHaveLength(3)
    expect(labels.at(0).text()).toBe('All')
    expect(labels.at(1).text()).toBe('Starred')
    expect(labels.at(2).text()).toBe('Not starred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()
    wrapper.findComponent(FilterType).vm.aggregate()

    await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(1).setChecked(true)
    expect(wrapper.vm.selected).toEqual([true])

    await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(1).setChecked(false)
    expect(wrapper.vm.selected).toEqual([])
  })

  it('should display the results count (without the "All")', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)).commit()
    // Await fetch() directly so getTotal resolves before assert
    await wrapper.vm.fetch()
    // fetch() calls fetchIndicesStarredDocuments which is mocked to [], so set docs after
    starredStore.setDocuments([{ index, id: 'document_01' }, { index, id: 'document_02' }])

    await wrapper.findComponent(FilterType).vm.aggregate()

    // entries: [0] = All (inside FilterTypeAll), [1] = Starred, [2] = Not starred
    const entries = wrapper.findAllComponents(FiltersPanelSectionFilterEntry)
    expect(entries[1].props('count')).toBe(2)
    expect(entries[2].props('count')).toBe(0)
  })
})
