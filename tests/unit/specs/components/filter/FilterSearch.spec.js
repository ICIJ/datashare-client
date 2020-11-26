import find from 'lodash/find'
import toLower from 'lodash/toLower'
import '@testing-library/jest-dom'
import { createLocalVue, mount } from '@vue/test-utils'

import FilterSearch from '@/components/filter/FilterSearch'
import FilterText from '@/components/filter/types/FilterText'

import { Core } from '@/core'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

jest.mock('@/api', () => {
  const { jsonResp } = require('tests/unit/tests_utils')
  return jest.fn(() => {
    return {
      deleteNamedEntitiesByMentionNorm: jest.fn().mockReturnValue(jsonResp())
    }
  })
})

describe('FilterSearch.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const project = toLower('FilterSearch')
  esConnectionHelper(project)
  let wrapper = null

  beforeEach(() => {
    store.commit('search/reset')
    store.commit('search/index', project)
    const filter = find(store.getters['search/instantiatedFilters'], { name: 'contentType' })

    wrapper = mount(FilterSearch, {
      i18n,
      localVue,
      store,
      wait,
      propsData: {
        filter,
        modelQuery: ''
      }
    })
  })

  afterAll(() => jest.unmock('@/api'))

  it('should have a filter component', async () => {
    await wrapper.vm.$nextTick()
    const filterComponent = wrapper.findComponent(FilterText)
    expect(filterComponent.exists()).toBeTruthy()
  })

  it('should have a filter component with a modelQuery', async () => {
    wrapper.setProps({ modelQuery: 'foo' })
    await wrapper.vm.$nextTick()
    const filterComponent = wrapper.findComponent(FilterText)
    expect(filterComponent.props('modelQuery')).toBe('foo')
    wrapper.setProps({ modelQuery: 'bar' })
    await wrapper.vm.$nextTick()
    expect(filterComponent.props('modelQuery')).toBe('bar')
  })
})
