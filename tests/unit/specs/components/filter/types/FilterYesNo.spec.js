import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FilterStarred from '@/components/filter/types/FilterStarred'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

const { i18n, localVue, store, router, wait } = Core.init(createLocalVue()).useAll()

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: [] })
  }
})

// Mock the refreshRouteAndSearch method to avoid unecessary route update
FilterStarred.methods.refreshRouteAndSearch = jest.fn()

describe('FilterStarred.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const filter = store.getters['search/getFilter']({ name: 'starred' })
  let wrapper
  jest.setTimeout(1e4)

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(() => {
    wrapper = mount(FilterStarred, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: {
        filter
      }
    })
    store.commit('search/index', index)
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    jest.unmock('@/api')
  })

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

    expect(wrapper.findAll('.filter__items__item .custom-control-label .filter__items__item__label')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item').at(0).find('.custom-control-label .filter__items__item__label').text()).toBe('Starred')
    expect(wrapper.findAll('.filter__items__item').at(1).find('.custom-control-label .filter__items__item__label').text()).toBe('Not starred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()
    const filterBoilerplateWrapper = wrapper.findComponent({ ref: 'filter' })
    await filterBoilerplateWrapper.vm.aggregate()

    expect(filterBoilerplateWrapper.vm.selected).toEqual([])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeTruthy()

    await wrapper.findAll('.filter__items__item .custom-control-input').at(0).setChecked()
    expect(filterBoilerplateWrapper.vm.selected).toEqual([true])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeFalsy()

    await wrapper.findAll('.filter__items__item .custom-control-input').at(1).setChecked()
    expect(filterBoilerplateWrapper.vm.selected).toEqual([false])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeFalsy()

    await wrapper.findAll('.filter__items__item .custom-control-input').at(1).trigger('click')
    expect(filterBoilerplateWrapper.vm.selected).toEqual([])
    expect(filterBoilerplateWrapper.vm.isAllSelected).toBeTruthy()
  })

  it('should fetch the starred documents', async () => {
    store.commit('starred/documents', [{ index, id: 'document' }])
    await letData(es).have(new IndexedDocument('document', index)).commit()

    expect(wrapper.vm.starredDocuments).toEqual([{ index, id: 'document' }])
  })

  it('should display the results count', async () => {
    store.commit('starred/documents', [
      { index, id: 'document_01' },
      { index, id: 'document_02' }
    ])
    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)).commit()
    await letData(es).have(new IndexedDocument('document_03', index)).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate()

    expect(wrapper.findAll('.filter__items__item .filter__items__item__count')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item').at(0).find('.filter__items__item__count').text()).toBe('2')
    expect(wrapper.findAll('.filter__items__item').at(1).find('.filter__items__item__count').text()).toBe('1')
  })

  it('should not display the exclude button', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.findComponent({ ref: 'filter' }).vm.aggregate()
    await wrapper.findAll('.filter__items__item').at(0).find('.custom-control-input').trigger('click')
    store.commit('search/addFilterValue', { name: 'starred', value: true })
    wrapper.findComponent({ ref: 'filter' }).vm.collapseItems = false

    expect(wrapper.findAll('.filter__footer__action--invert')).toHaveLength(0)
  })
})
