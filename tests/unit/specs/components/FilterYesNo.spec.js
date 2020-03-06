import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import FilterYesNo from '@/components/FilterYesNo'
import { IndexedDocument, letData } from 'tests/unit/es_utils'

const { localVue, store, router, wait } = Core.init(createLocalVue()).useAll()

jest.mock('@/api', () => {
  const { jsonResp } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      getStarredDocuments: jest.fn().mockReturnValue(jsonResp())
    }
  })
})

describe('FilterYesNo.vue', () => {
  const index = toLower('FilterYesNo')
  esConnectionHelper(index)
  const es = esConnectionHelper.es
  let wrapper
  jest.setTimeout(1e4)

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(() => {
    wrapper = mount(FilterYesNo, {
      localVue,
      router,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'starred' }) },
      mocks: { $t: msg => msg, $te: msg => msg, $n: msg => msg }
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

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.filter__items__all')).toHaveLength(1)
    expect(wrapper.find('.filter__items__all .filter__items__item__label').text()).toBe('all')
    expect(wrapper.find('.filter__items__all .filter__items__item__count').text()).toBe('2')
  })

  it('should display 2 items for the starred filter', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.filter__items__item .custom-control-label .filter__items__item__label')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item').at(0).find('.custom-control-label .filter__items__item__label').text()).toBe('filter.starred')
    expect(wrapper.findAll('.filter__items__item').at(1).find('.custom-control-label .filter__items__item__label').text()).toBe('filter.notStarred')
  })

  it('should change the selected value', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.vm.root.isAllSelected).toBeTruthy()

    await wrapper.findAll('.filter__items__item .custom-control-input').at(0).setChecked()
    expect(wrapper.vm.selected).toEqual([true])
    expect(wrapper.vm.root.isAllSelected).toBeFalsy()

    await wrapper.findAll('.filter__items__item .custom-control-input').at(1).setChecked()
    expect(wrapper.vm.selected).toEqual([false])
    expect(wrapper.vm.root.isAllSelected).toBeFalsy()

    await wrapper.findAll('.filter__items__item .custom-control-input').at(1).trigger('click')
    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.vm.root.isAllSelected).toBeTruthy()
  })

  it('should fetch the starred documents', async () => {
    store.commit('search/starredDocuments', ['document'])
    await letData(es).have(new IndexedDocument('document', index)).commit()

    expect(wrapper.vm.starredDocuments).toEqual(['document'])
  })

  it('should hide the "Show more" button', async () => {
    await letData(es).have(new IndexedDocument('doc_04', index)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.filter__items__display')).toHaveLength(0)
  })

  it('should display the results count', async () => {
    store.commit('search/starredDocuments', ['document_01', 'document_02'])
    await letData(es).have(new IndexedDocument('document_01', index)).commit()
    await letData(es).have(new IndexedDocument('document_02', index)).commit()
    await letData(es).have(new IndexedDocument('document_03', index)).commit()

    await wrapper.vm.root.aggregate()

    expect(wrapper.findAll('.filter__items__item .filter__items__item__count')).toHaveLength(2)
    expect(wrapper.findAll('.filter__items__item').at(0).find('.filter__items__item__count').text()).toBe('2')
    expect(wrapper.findAll('.filter__items__item').at(1).find('.filter__items__item__count').text()).toBe('1')
  })

  it('should not display the exclude button', async () => {
    await letData(es).have(new IndexedDocument('document', index)).commit()

    await wrapper.vm.root.aggregate()
    await wrapper.findAll('.filter__items__item').at(0).find('.custom-control-input').trigger('click')
    store.commit('search/addFilterValue', { name: 'starred', value: true })
    wrapper.vm.root.collapseItems = false

    expect(wrapper.findAll('.filter__header__invert')).toHaveLength(0)
  })
})
