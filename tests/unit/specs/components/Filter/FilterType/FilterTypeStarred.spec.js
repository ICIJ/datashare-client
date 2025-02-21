import { mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { useStarredStore, useSearchStore } from '@/store/modules'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeStarred from '@/components/Filter/FilterType/FilterTypeStarred'
import CoreSetup from '~tests/unit/CoreSetup'

describe('FilterTypeStarred.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let api, core, starredStore, searchStore, wrapper

  beforeAll(() => {
    api = { getStarredDocuments: vi.fn().mockResolvedValue([]), elasticsearch: es }
    core = CoreSetup.init(api).useAll().useRouter()
    starredStore = useStarredStore(api)
    searchStore = useSearchStore()
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    const filter = searchStore.getFilter({ name: 'starred' })
    const props = { filter }
    const global = { plugins: core.plugins }
    searchStore.setIndex(index)
    wrapper = mount(FilterTypeStarred, { props, global })
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  it('should display 2 items for the starred filter', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.findComponent(FilterType).vm.aggregate()

    const labels = wrapper.findAll('.filters-panel-section-filter-entry__label')
    expect(labels).toHaveLength(2)
    expect(labels.at(0).text()).toBe('Starred')
    expect(labels.at(1).text()).toBe('Not starred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()
    wrapper.findComponent(FilterType).vm.aggregate()

    await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(0).setChecked(true)
    expect(wrapper.vm.selected).toEqual([true])

    await wrapper.findAll('.filters-panel-section-filter-entry .form-check-input').at(0).setChecked(false)
    expect(wrapper.vm.selected).toEqual([])
  })

  it('should display the results count', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)).commit()
    await letData(es).have(new IndexedDocument('document_03', index)).commit()

    starredStore.setDocuments([
      {
        index,
        id: 'document_01'
      },
      {
        index,
        id: 'document_02'
      }
    ])

    await wrapper.findComponent(FilterType).vm.aggregate()

    expect(wrapper.findAll('.filters-panel-section-filter-entry__count')).toHaveLength(2)
    expect(wrapper.findAll('.filters-panel-section-filter-entry__count').at(0).text()).toBe('2')
  })
})
