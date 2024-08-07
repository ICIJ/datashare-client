import { shallowMount } from '@vue/test-utils'

import SearchBarInputDropdown from '@/components/Search/SearchBar/SearchBarInputDropdown'
import CoreSetup from '~tests/unit/CoreSetup'

describe('SearchBarInputDropdown.vue', function () {
  const { plugins, config } = CoreSetup.init().useAll().useRouter()
  let wrapper

  beforeAll(() => {
    config.set('projects', [{ name: 'local-datashare', label: 'default' }])
    const options = ['all', 'relevance', 'creationDateNewest']
    const optionsPath = ['search', 'field']
    const props = { options, optionsPath, value: 'all' }
    wrapper = shallowMount(SearchBarInputDropdown, {
      props,
      global: {
        plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  it('should display a dropdown with 2 options fields', () => {
    expect(wrapper.findAll('b-dropdown-item-stub')).toHaveLength(3)
  })

  it('should display a dropdown with "All fields" selected by default', () => {
    expect(wrapper.find('b-dropdown-item-stub[active=true]').text().trim()).toBe('All fields')
  })
})
