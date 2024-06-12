import { mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocument, letData } from '~tests/unit/es_utils'
import { flushPromises } from '~tests/unit/tests_utils'
import FilterStarred from '@/components/filter/types/FilterStarred'
import CoreSetup from '~tests/unit/CoreSetup'

// Mock the refreshRouteAndSearch method to avoid unnecessary route update
FilterStarred.methods.refreshRouteAndSearch = vi.fn()

describe('FilterStarred.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let api, core, wrapper

  beforeAll(() => {
    api = { getStarredDocuments: vi.fn().mockResolvedValue([]), elasticsearch: es }
    core = CoreSetup.init(api).useAll().useRouter()
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
  })

  beforeEach(() => {
    const filter = core.store.getters['search/getFilter']({ name: 'starred' })

    wrapper = mount(FilterStarred, {
      props: { filter },
      global: {
        plugins: core.plugins
      }
    })

    core.core.store.commit('search/index', index)
  })

  afterAll(() => removeCookie(process.env.VITE_DS_COOKIE_NAME))

  it('should display "All" as the first item', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate()

    expect(wrapper.findAll('.filter__items__all')).toHaveLength(1)
    expect(wrapper.find('.filter__items__all .filter__items__item__label').text()).toBe('All')
    expect(wrapper.find('.filter__items__all .filter__items__item__count').text()).toBe('2')
  })

  it('should display 2 items for the starred filter', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate()

    const labels = wrapper.findAll('.filter__items__item .form-check .filter__items__item__label')
    expect(labels).toHaveLength(2)
    expect(labels.at(0).text()).toBe('Starred')
    expect(labels.at(1).text()).toBe('Not starred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()
    const filterBoilerplateWrapper = wrapper.findComponent({ ref: 'filter' })
    await filterBoilerplateWrapper.vm.aggregate()

    expect(filterBoilerplateWrapper.vm.selected).toEqual([])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeTruthy()

    await wrapper.findAll('.filter__items__item .form-check-input').at(0).setChecked()
    expect(filterBoilerplateWrapper.vm.selected).toEqual([true])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeFalsy()

    await wrapper.findAll('.filter__items__item .form-check-input').at(1).setChecked()
    expect(filterBoilerplateWrapper.vm.selected).toEqual([false])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeFalsy()

    await wrapper.findAll('.filter__items__item .form-check-input').at(1).setChecked(false)
    expect(filterBoilerplateWrapper.vm.selected).toEqual([])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeTruthy()
  })

  it('should fetch the starred documents', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()
    core.store.commit('starred/documents', [
      {
        index,
        id: 'document'
      }
    ])
    await flushPromises()
    expect(wrapper.vm.starredDocuments).toEqual([
      {
        index,
        id: 'document'
      }
    ])
  })

  it('should display the results count', async () => {
    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)).commit()
    await letData(es).have(new IndexedDocument('document_03', index)).commit()
    core.store.commit('starred/documents', [
      {
        index,
        id: 'document_01'
      },
      {
        index,
        id: 'document_02'
      }
    ])

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate()

    expect(wrapper.findAll('.filter__items__item .filter__items__item__count')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item').at(0).find('.filter__items__item__count').text()).toBe('2')
    expect(wrapper.findAll('.filter__items__item').at(1).find('.filter__items__item__count').text()).toBe('1')
  })

  it('should not display the exclude button', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate()
    await wrapper.findAll('.filter__items__item').at(0).find('.form-check-input').setChecked()
    core.store.commit('search/addFilterValue', {
      name: 'starred',
      value: true
    })
    wrapper.findComponent({ ref: 'filter' }).vm.collapseItems = false

    expect(wrapper.findAll('.filter__footer__action--exclude')).toHaveLength(0)
  })
})
