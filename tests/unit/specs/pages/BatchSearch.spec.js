import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { Core } from '@/core'
import BatchSearch from '@/pages/BatchSearch'

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve([{
        uuid: 1,
        project: { name: 'project_01' },
        name: 'name_01',
        description: 'description_01',
        date: '2019-01-01',
        nbResults: 2,
        nbQueries: 1
      }, {
        uuid: 2,
        project: { name: 'project_02' },
        name: 'name_02',
        description: 'description_02',
        date: '2019-01-01',
        nbResults: 3,
        nbQueries: 2
      }]))
    }
  })
})

describe('BatchSearch.vue', () => {
  const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null

  beforeAll(() => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    Murmur.config.merge({ multipleProjects: true })
  })

  beforeEach(async () => {
    wrapper = mount(BatchSearch, { i18n, localVue, router, store, wait })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => {
    jest.unmock('@/api')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should list the batchSearches', () => {
    expect(wrapper.findAll('.batch-search__items__item')).toHaveLength(2)
  })

  it('should display 9 columns of info per row', () => {
    expect(wrapper.findAll('.batch-search__items__item:nth-child(1) td')).toHaveLength(9)
  })

  it('should display the number of queries per batchSearch', () => {
    expect(wrapper.find('.batch-search__items__item:nth-child(1) td[aria-colindex="5"]').text()).toBe('1 query')
    expect(wrapper.find('.batch-search__items__item:nth-child(2) td[aria-colindex="5"]').text()).toBe('2 queries')
  })

  it('should display index in the batch search results url', () => {
    expect(wrapper.find('.batch-search__items__item:nth-child(1) td[aria-colindex="2"] a').attributes('href')).toContain('/project_01/')
  })
})
