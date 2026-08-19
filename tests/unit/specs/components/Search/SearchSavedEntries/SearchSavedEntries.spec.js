import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchSavedEntries from '@/components/Search/SearchSavedEntries/SearchSavedEntries'

describe('SearchSavedEntries.vue', () => {
  it('should keep every value of a multi-value filter in the saved search link', () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const global = { plugins: core.plugins }
    const events = [
      {
        id: 'id_01',
        name: 'name_01',
        creationDate: 'creation_date_01',
        uri: '?q=*&f[language]=GERMAN&f[language]=VIETNAMESE'
      }
    ]
    const wrapper = mount(SearchSavedEntries, { props: { events }, global })
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.props('to').query['f[language]']).toEqual(['GERMAN', 'VIETNAMESE'])
  })
})
