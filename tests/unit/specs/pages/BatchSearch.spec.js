import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'

import { Core } from '@/core'
import BatchSearch from '@/pages/BatchSearch'

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve({
        batchSearches: [{
          uuid: '1',
          project: { name: 'project_01' },
          name: 'name_01',
          description: 'description_01',
          date: '2019-01-01',
          nbResults: 2,
          nbQueries: 1,
          state: 'SUCCESS'
        }, {
          uuid: '2',
          project: { name: 'project_02' },
          name: 'name_02',
          description: 'description_02',
          date: '2019-01-01',
          nbResults: 3,
          nbQueries: 2,
          state: 'FAILURE'
        }],
        total: 2
      }))
    }
  })
})

describe('BatchSearch.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const router = new VueRouter({
    routes: [
      {
        name: 'batch-search',
        path: 'batch-search'
      }, {
        name: 'batch-search.results',
        path: 'batch-search/:index/:uuid'
      }
    ]
  })
  let wrapper = null

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  beforeEach(async () => {
    wrapper = mount(BatchSearch, { i18n, localVue, router, store, wait })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => {
    jest.unmock('@/api')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  describe('SERVER mode', () => {
    beforeAll(() => Murmur.config.merge({ mode: 'SERVER' }))

    it('should display a search bar', () => {
      expect(wrapper.find('.batch-search__search-bar').exists()).toBeTruthy()
    })

    it('should list the batchSearches', () => {
      expect(wrapper.findAll('.batch-search__items__item')).toHaveLength(2)
    })

    it('should have author field in server mode in fieldOptions', () => {
      expect(wrapper.find('.batch-search__search-bar__field__items:nth-child(4)').text()).toContain('Author')
    })

    it('should display 9 columns of info per row', () => {
      expect(wrapper.findAll('.batch-search__items__item:nth-child(1) td')).toHaveLength(9)
    })

    it('should display project name in the batch search results url', () => {
      expect(wrapper.find('.batch-search__items__item:nth-child(1) td[aria-colindex="2"] a')
        .attributes('href')).toContain('/project_01/')
    })

    it('should display badge if batchSearch state is fail, but no badge if state is not fail', () => {
      expect(wrapper.findAll('.batch-search__items__item:nth-child(1) > td[aria-colindex="6"] span'))
        .toHaveLength(1)
      expect(wrapper.findAll('.batch-search__items__item:nth-child(2) > td[aria-colindex="6"] span'))
        .toHaveLength(2)
    })

    it('should display the number of queries per batchSearch', () => {
      expect(wrapper.find('.batch-search__items__item:nth-child(1) td[aria-colindex="5"]')
        .text()).toBe('1 query')
      expect(wrapper.find('.batch-search__items__item:nth-child(2) td[aria-colindex="5"]')
        .text()).toBe('2 queries')
    })

    it('should redirect on sort changed', async () => {
      jest.spyOn(router, 'push')

      await wrapper.vm.sortChanged({ sortBy: 'nbResults', sortDesc: true })

      expect(router.push).toBeCalled()
      expect(router.push).toBeCalledWith({
        name: 'batch-search',
        query: { page: 1, sort: 'batch_results', order: 'desc', query: '', field: 'all' }
      })
    })

    it('should redirect on search', async () => {
      const query = 'this is my query'
      jest.spyOn(router, 'push')
      wrapper.vm.$set(wrapper.vm, 'page', 2)
      wrapper.vm.$set(wrapper.vm, 'search', query)

      await wrapper.vm.searchBatchsearches()

      expect(router.push).toBeCalled()
      expect(router.push).toBeCalledWith({
        name: 'batch-search',
        query: { page: 1, sort: 'batch_date', order: 'desc', query, field: 'all' }
      })
    })

    it('should execute "fetch" on query change', async () => {
      const fetchSpy = jest.spyOn(wrapper.vm, 'fetch')
      expect(fetchSpy).not.toBeCalled()

      wrapper.vm.query = 'new search'
      await wrapper.vm.$nextTick()

      expect(fetchSpy).toBeCalled()
    })

    it('should NOT display a pagination', async () => {
      await wrapper.setData({ perPage: 5 })

      expect(wrapper.find('.pagination.b-pagination').exists()).toBeFalsy()
    })

    it('should display a pagination', async () => {
      await wrapper.setData({ perPage: 1 })

      expect(wrapper.find('.pagination.b-pagination').exists()).toBeTruthy()
    })
  })

  describe('LOCAL mode', () => {
    beforeAll(() => Murmur.config.merge({ mode: 'LOCAL' }))

    it('should NOT have author field in local mode in fieldOptions', () => {
      expect(wrapper.findAll('.batch-search__search-bar__field__items')).toHaveLength(3)
    })

    it('should NOT display project name in the batch search results url', () => {
      expect(wrapper.find('.batch-search__items__item:nth-child(1) td[aria-colindex="2"] a').exists()).toBeFalsy()
    })

    it('should display 6 columns of info per row', () => {
      expect(wrapper.find('.batch-search__search-bar__field__items:nth-child(4)').exists()).toBeFalsy()
    })
  })
})
