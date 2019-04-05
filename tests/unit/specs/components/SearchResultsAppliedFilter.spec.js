import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import BBadge from 'bootstrap-vue/es/components/badge/badge'
import Murmur from '@icij/murmur'

const localVue = createLocalVue()
localVue.use(Murmur)
localVue.component('b-badge', BBadge)

describe('SearchResultsAppliedFilter.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchResultsAppliedFilter, { localVue, propsData: { term: 'trump' } })
  })

  it('should display a filter', () => {
    expect(wrapper.findAll('.search-results__header__active-filters__filter')).toHaveLength(1)
    expect(wrapper.find('.search-results__header__active-filters__filter').text()).toEqual('trump')
  })
})
