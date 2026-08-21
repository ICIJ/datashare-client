import { mount } from '@vue/test-utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { useLockedFiltersStore, useStarredStore, useSearchStore } from '@/store/modules'
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
    // searchStore (from beforeAll) is shared across every test in this file
    // — reset the starred filter's ticked values so one test's checkbox
    // clicks don't leak into the next.
    searchStore.setFilterValue({ name: 'starred', value: [] })
    // CoreSetup falls back to the app's singleton pinia (with the locked
    // filters store's `persist: true`), so entries otherwise leak across
    // tests in this file.
    useLockedFiltersStore().unlockAll()
    wrapper = mount(FilterTypeStarred, { props, global })
  })

  function findLockButtons(wrapper) {
    return wrapper.findAll('.filters-panel-section-filter-entry__lock')
  }

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

  describe('locking', () => {
    it('renders a lock button for Starred and Not starred even when neither ticked nor locked (reserved slot, hidden via CSS)', () => {
      expect(findLockButtons(wrapper)).toHaveLength(2)
    })

    it('also ticks an unticked entry when clicking its lock button — one click both applies and locks it', async () => {
      const lockedFiltersStore = useLockedFiltersStore()

      await findLockButtons(wrapper).at(0).trigger('click')

      expect(wrapper.vm.selected).toEqual([true])
      expect(lockedFiltersStore.isLocked({ name: 'starred', value: true })).toBe(true)
    })

    it('locks the starred value when clicking the lock button on a ticked entry', async () => {
      const lockedFiltersStore = useLockedFiltersStore()
      await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(1).setChecked(true)

      await findLockButtons(wrapper).at(0).trigger('click')

      expect(lockedFiltersStore.isLocked({ name: 'starred', value: true })).toBe(true)
    })

    it('still renders a locked lock button for a locked-but-unticked entry', async () => {
      const lockedFiltersStore = useLockedFiltersStore()
      lockedFiltersStore.lock({ name: 'starred', value: false, label: 'Not starred' })
      wrapper = mount(FilterTypeStarred, { props: { filter: searchStore.getFilter({ name: 'starred' }) }, global: { plugins: core.plugins } })

      const notStarredLock = findLockButtons(wrapper).at(1)
      expect(notStarredLock.attributes('aria-pressed')).toBe('true')
    })

    it('unlocks the starred value when unticking a locked entry', async () => {
      const lockedFiltersStore = useLockedFiltersStore()
      await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(1).setChecked(true)
      lockedFiltersStore.lock({ name: 'starred', value: true, label: 'Starred' })

      await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(1).setChecked(false)

      expect(lockedFiltersStore.isLocked({ name: 'starred', value: true })).toBe(false)
    })
  })
})
